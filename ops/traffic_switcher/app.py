from __future__ import annotations

import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, conint
from kubernetes import client, config
from kubernetes.client import V1ObjectMeta
from prometheus_client import Counter, Gauge, CONTENT_TYPE_LATEST, generate_latest
from starlette.responses import PlainTextResponse, JSONResponse

APP_NAME = "traffic_switcher"

# Environment configuration
NAMESPACE = os.getenv("NAMESPACE", "mksaas")
CANARY_INGRESS_NAME = os.getenv("CANARY_INGRESS_NAME", "mksaas-ingress-canary")
DEFAULT_HOST = os.getenv("DEFAULT_HOST", "your-domain.com")

# Prometheus metrics
switch_events = Counter(
    "traffic_switch_events_total",
    "Number of traffic switch operations performed",
    labelnames=("host", "outcome"),
)
current_weight = Gauge(
    "traffic_switch_weight",
    "Current canary traffic weight (0-100)",
    labelnames=("host",),
)


def _init_k8s() -> None:
    """Initialize Kubernetes client either in-cluster or via local kubeconfig."""
    try:
        config.load_incluster_config()
    except Exception:
        # Fallback for local testing
        config.load_kube_config()


_init_k8s()
_k8s = client.NetworkingV1Api()


class SwitchRequest(BaseModel):
    host: Optional[str] = Field(default=None, description="Ingress host to target")
    canary_weight: conint(ge=0, le=100) = Field(
        description="Desired canary traffic percentage (0-100)"
    )
    dry_run: bool = Field(default=False, description="If true, do not apply changes")


app = FastAPI(title="Traffic Switcher", version="0.1.0")


@app.get("/healthz")
async def healthz() -> dict:
    return {"status": "ok"}


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/status")
async def status(host: Optional[str] = None) -> JSONResponse:
    h = host or DEFAULT_HOST
    try:
        ing = _k8s.read_namespaced_ingress(CANARY_INGRESS_NAME, NAMESPACE)
    except client.exceptions.ApiException as e:
        raise HTTPException(status_code=500, detail=f"Cannot read ingress: {e}")

    annotations = (ing.metadata.annotations or {})
    weight_str = annotations.get("nginx.ingress.kubernetes.io/canary-weight", "0")
    try:
        w = int(weight_str)
    except ValueError:
        w = 0
    current_weight.labels(h).set(w)

    return JSONResponse({
        "host": h,
        "canary_ingress": CANARY_INGRESS_NAME,
        "namespace": NAMESPACE,
        "canary_weight": w,
        "annotations": annotations,
    })


def _patch_canary_weight(weight: int) -> None:
    body = {
        "metadata": {
            "annotations": {
                "nginx.ingress.kubernetes.io/canary": "true",
                "nginx.ingress.kubernetes.io/canary-weight": str(weight),
            }
        }
    }
    _k8s.patch_namespaced_ingress(name=CANARY_INGRESS_NAME, namespace=NAMESPACE, body=body)


@app.post("/switch")
async def switch(req: SwitchRequest) -> JSONResponse:
    host = req.host or DEFAULT_HOST
    try:
        if req.dry_run:
            # Read current status only
            ing = _k8s.read_namespaced_ingress(CANARY_INGRESS_NAME, NAMESPACE)
            before = (ing.metadata.annotations or {}).get(
                "nginx.ingress.kubernetes.io/canary-weight", "0"
            )
            return JSONResponse({
                "dry_run": True,
                "host": host,
                "current_weight": int(before) if before.isdigit() else before,
                "new_weight": req.canary_weight,
            })

        _patch_canary_weight(req.canary_weight)
        current_weight.labels(host).set(req.canary_weight)
        switch_events.labels(host=host, outcome="success").inc()
        return JSONResponse({"host": host, "canary_weight": req.canary_weight, "status": "ok"})
    except client.exceptions.ApiException as e:
        switch_events.labels(host=host, outcome="k8s_error").inc()
        raise HTTPException(status_code=500, detail=f"Kubernetes API error: {e}")
    except Exception as e:
        switch_events.labels(host=host, outcome="error").inc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8080, reload=True)
