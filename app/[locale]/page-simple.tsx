export default function SimpleHomePage() {
  return (
    <div
      style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}
    >
      <h1 style={{ color: '#6b46c1', fontSize: '48px' }}>✅ 气流AI 首页</h1>
      <p style={{ fontSize: '20px', color: '#666' }}>
        欢迎来到气流AI - 智能八字风水分析平台
      </p>
      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f0f0f0',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '30px auto',
        }}
      >
        <h2>测试链接</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '10px 0' }}>
            <a
              href="/zh-CN/unified-form"
              style={{
                color: '#6b46c1',
                textDecoration: 'none',
                fontSize: '18px',
              }}
            >
              → 一页式表单
            </a>
          </li>
          <li style={{ margin: '10px 0' }}>
            <a
              href="/zh-CN/test-simple"
              style={{
                color: '#6b46c1',
                textDecoration: 'none',
                fontSize: '18px',
              }}
            >
              → 简单测试页
            </a>
          </li>
        </ul>
      </div>
      <p style={{ color: '#999', fontSize: '14px', marginTop: '50px' }}>
        如果你能看到这个页面，说明 [locale]/page.tsx 工作正常
      </p>
    </div>
  );
}
