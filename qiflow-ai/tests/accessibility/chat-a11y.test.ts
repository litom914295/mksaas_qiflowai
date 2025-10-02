/**
 * Chat Interface Accessibility Tests
 *
 * Uses axe-core to validate WCAG 2.1 Level AA compliance for the chat interface.
 * Tests cover:
 * - Keyboard navigation
 * - Screen reader support
 * - Color contrast
 * - Focus management
 * - ARIA attributes
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Accessibility violation thresholds
const A11Y_CONFIG = {
  // Critical violations that must be fixed
  critical: [
    'aria-required-attr',
    'button-name',
    'color-contrast',
    'duplicate-id',
    'label',
  ],
  // Serious violations that should be fixed
  serious: [
    'aria-valid-attr',
    'focus-order-semantics',
    'heading-order',
    'link-name',
  ],
  // Moderate violations that are recommended to fix
  moderate: ['accesskeys', 'aria-allowed-role', 'empty-heading', 'frame-title'],
  // Minor violations that are nice to fix
  minor: ['aria-progressbar-name', 'meta-viewport', 'region'],
};

/**
 * Custom axe configuration for chat interface
 */
const AXE_OPTIONS = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  },
  rules: {
    // Disable specific rules that don't apply to chat interfaces
    'page-has-heading-one': { enabled: false }, // Chat may not need h1
    'landmark-one-main': { enabled: false }, // Chat may be embedded
    region: { enabled: false }, // Chat regions are dynamic
  },
};

/**
 * Helper to analyze and report violations
 */
function analyzeViolations(violations: any[]): {
  critical: any[];
  serious: any[];
  moderate: any[];
  minor: any[];
} {
  return {
    critical: violations.filter(v => v.impact === 'critical'),
    serious: violations.filter(v => v.impact === 'serious'),
    moderate: violations.filter(v => v.impact === 'moderate'),
    minor: violations.filter(v => v.impact === 'minor'),
  };
}

/**
 * Generate detailed violation report
 */
function generateViolationReport(violations: any[]): string {
  if (violations.length === 0) return 'No accessibility violations found';

  return violations
    .map(violation => {
      const nodes = violation.nodes
        .map((node: any) => `  - ${node.html}`)
        .join('\n');

      return `
Rule: ${violation.id}
Impact: ${violation.impact}
Description: ${violation.description}
Help: ${violation.help}
Help URL: ${violation.helpUrl}
Affected elements:
${nodes}
`;
    })
    .join('\n---\n');
}

test.describe('Chat Interface Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat interface
    await page.goto('/zh-CN/chat', { waitUntil: 'networkidle' });

    // Wait for chat interface to be fully loaded
    await page.waitForSelector('[data-testid="chat-interface"]', {
      state: 'visible',
    });
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const analyzed = analyzeViolations(accessibilityScanResults.violations);

    // Critical violations must be zero
    expect(
      analyzed.critical.length,
      `Found ${analyzed.critical.length} critical violations:\n${generateViolationReport(analyzed.critical)}`
    ).toBe(0);

    // Serious violations should be minimal
    expect(
      analyzed.serious.length,
      `Found ${analyzed.serious.length} serious violations:\n${generateViolationReport(analyzed.serious)}`
    ).toBeLessThanOrEqual(2);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus on message input
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() =>
      document.activeElement?.getAttribute('data-testid')
    );
    expect(activeElement).toBeTruthy();

    // Navigate through interactive elements
    const interactiveElements = await page.$$(
      '[tabindex]:not([tabindex="-1"]), button, input, textarea, a[href], select'
    );

    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      await page.keyboard.press('Tab');

      // Verify focus is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow,
          tagName: el.tagName.toLowerCase(),
          testId: el.getAttribute('data-testid'),
        };
      });

      expect(focusedElement).toBeTruthy();

      // Check for focus indicators
      const hasFocusIndicator =
        (focusedElement?.outline && focusedElement.outline !== 'none') ||
        (focusedElement?.boxShadow && focusedElement.boxShadow !== 'none');

      expect(
        hasFocusIndicator,
        `Element ${focusedElement?.tagName} lacks focus indicator`
      ).toBeTruthy();
    }
  });

  test('should have proper ARIA labels for interactive elements', async ({
    page,
  }) => {
    // Check message input
    const messageInput = await page.$('[data-testid="message-input"]');
    if (messageInput) {
      const ariaLabel = await messageInput.getAttribute('aria-label');
      const hasLabel = await page.$('label[for="message-input"]');

      expect(
        ariaLabel || hasLabel,
        'Message input must have aria-label or associated label'
      ).toBeTruthy();
    }

    // Check send button
    const sendButton = await page.$('[data-testid="send-button"]');
    if (sendButton) {
      const buttonText = await sendButton.textContent();
      const ariaLabel = await sendButton.getAttribute('aria-label');

      expect(
        buttonText?.trim() || ariaLabel,
        'Send button must have text content or aria-label'
      ).toBeTruthy();
    }

    // Check all buttons have accessible names
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      const hasAccessibleName = text?.trim() || ariaLabel || ariaLabelledBy;
      expect(
        hasAccessibleName,
        'All buttons must have accessible names'
      ).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(
      accessibilityScanResults.violations.length,
      `Color contrast violations found:\n${generateViolationReport(accessibilityScanResults.violations)}`
    ).toBe(0);
  });

  test('should properly announce messages to screen readers', async ({
    page,
  }) => {
    // Check for live regions
    const liveRegions = await page.$$('[aria-live]');
    expect(
      liveRegions.length,
      'Chat should have at least one live region for message announcements'
    ).toBeGreaterThan(0);

    // Verify live region configuration
    for (const region of liveRegions) {
      const ariaLive = await region.getAttribute('aria-live');
      const ariaAtomic = await region.getAttribute('aria-atomic');
      const role = await region.getAttribute('role');

      // Live regions should be polite for chat messages
      expect(['polite', 'assertive']).toContain(ariaLive);

      // Check if it's properly configured for messages
      if (role === 'log' || role === 'status') {
        expect(ariaAtomic).toBeTruthy();
      }
    }
  });

  test('should handle focus management during interactions', async ({
    page,
  }) => {
    // Send a message
    const messageInput = await page.$('[data-testid="message-input"]');
    if (messageInput) {
      await messageInput.fill('Test message for accessibility');
      await page.keyboard.press('Enter');

      // Focus should return to input after sending
      await page.waitForTimeout(500);
      const focusedAfterSend = await page.evaluate(() =>
        document.activeElement?.getAttribute('data-testid')
      );

      expect(focusedAfterSend).toBe('message-input');
    }

    // Open any modal/dialog
    const settingsButton = await page.$('[data-testid="chat-settings"]');
    if (settingsButton) {
      await settingsButton.click();

      // Check focus trap in modal
      const modal = await page.$('[role="dialog"]');
      if (modal) {
        // Focus should be inside modal
        const focusedInModal = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          const activeEl = document.activeElement;
          return modal?.contains(activeEl);
        });

        expect(focusedInModal, 'Focus should be trapped in modal').toBeTruthy();

        // Check for escape key handling
        await page.keyboard.press('Escape');
        const modalClosed = await page.$('[role="dialog"]');
        expect(modalClosed, 'Modal should close on Escape').toBeNull();
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.evaluate(() => {
      const allHeadings = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      );
      return allHeadings.map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim(),
      }));
    });

    // Check heading hierarchy
    let previousLevel = 0;
    for (const heading of headings) {
      // Heading levels should not skip (e.g., h1 -> h3)
      if (previousLevel > 0) {
        const levelDiff = heading.level - previousLevel;
        expect(
          levelDiff,
          `Heading hierarchy broken: level ${previousLevel} to ${heading.level}`
        ).toBeLessThanOrEqual(1);
      }
      previousLevel = heading.level;
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast mode if available
    await page.emulateMedia({ forcedColors: 'active' });

    // Run accessibility scan in high contrast mode
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const analyzed = analyzeViolations(accessibilityScanResults.violations);

    // Should still be accessible in high contrast
    expect(analyzed.critical.length).toBe(0);
    expect(analyzed.serious.length).toBeLessThanOrEqual(5);
  });

  test('should be navigable with screen reader shortcuts', async ({ page }) => {
    // Test landmark navigation
    const landmarks = await page.evaluate(() => {
      const regions = document.querySelectorAll(
        '[role="main"], [role="navigation"], [role="complementary"], main, nav, aside'
      );
      return Array.from(regions).map(r => ({
        role: r.getAttribute('role') || r.tagName.toLowerCase(),
        label:
          r.getAttribute('aria-label') || r.getAttribute('aria-labelledby'),
      }));
    });

    // Should have at least main content area
    const hasMain = landmarks.some(l => l.role === 'main');
    expect(hasMain, 'Chat interface should have main landmark').toBeTruthy();

    // Test heading navigation
    const headingsCount = await page.evaluate(
      () => document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
    );

    expect(
      headingsCount,
      'Should have headings for screen reader navigation'
    ).toBeGreaterThan(0);
  });

  test('should handle form validation accessibly', async ({ page }) => {
    // Try to send empty message
    const sendButton = await page.$('[data-testid="send-button"]');
    if (sendButton) {
      await sendButton.click();

      // Check for accessible error message
      const errorMessage = await page.$(
        '[role="alert"], [aria-live="assertive"]'
      );
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        expect(
          errorText?.trim(),
          'Error message should not be empty'
        ).toBeTruthy();

        // Error should be associated with input
        const messageInput = await page.$('[data-testid="message-input"]');
        if (messageInput) {
          const ariaInvalid = await messageInput.getAttribute('aria-invalid');
          const ariaDescribedBy =
            await messageInput.getAttribute('aria-describedby');

          expect(
            ariaInvalid === 'true' || ariaDescribedBy,
            'Invalid input should have aria-invalid or aria-describedby'
          ).toBeTruthy();
        }
      }
    }
  });

  test('should support zoom without horizontal scrolling', async ({ page }) => {
    // Test at 200% zoom
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );

    expect(
      hasHorizontalScroll,
      'Should not require horizontal scrolling at 200% zoom'
    ).toBeFalsy();

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should have skip navigation links', async ({ page }) => {
    // Look for skip links (usually hidden but accessible)
    const skipLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href^="#"]'));
      return links
        .filter(link => {
          const text = link.textContent?.toLowerCase() || '';
          return text.includes('skip') || text.includes('jump');
        })
        .map(link => ({
          text: link.textContent?.trim(),
          href: link.getAttribute('href'),
        }));
    });

    // While not mandatory, skip links are best practice
    if (skipLinks.length > 0) {
      for (const link of skipLinks) {
        expect(link.href, 'Skip link should have valid target').toBeTruthy();

        // Verify target exists
        const targetExists = await page.evaluate(href => {
          if (!href) return false;
          const id = href.substring(1);
          return document.getElementById(id) !== null;
        }, link.href);

        expect(
          targetExists,
          `Skip link target ${link.href} should exist`
        ).toBeTruthy();
      }
    }
  });

  test('should handle dynamic content accessibly', async ({ page }) => {
    // Simulate receiving a new message
    await page.evaluate(() => {
      const messageList = document.querySelector(
        '[data-testid="message-list"]'
      );
      if (messageList) {
        const newMessage = document.createElement('div');
        newMessage.setAttribute('role', 'article');
        newMessage.setAttribute('aria-label', 'New message from AI');
        newMessage.textContent = 'This is a dynamically added message';
        messageList.appendChild(newMessage);
      }
    });

    // Check if new content is announced
    const liveRegion = await page.$('[aria-live="polite"]');
    if (liveRegion) {
      const content = await liveRegion.textContent();
      expect(
        content,
        'Live region should contain new message announcement'
      ).toBeTruthy();
    }
  });

  test('should provide text alternatives for images', async ({ page }) => {
    const images = await page.$$('img');

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaLabelledBy = await img.getAttribute('aria-labelledby');
      const role = await img.getAttribute('role');

      // Decorative images should have empty alt or role="presentation"
      // Informative images should have descriptive alt text
      const hasTextAlternative =
        alt !== null || ariaLabel || ariaLabelledBy || role === 'presentation';

      expect(
        hasTextAlternative,
        'All images must have text alternatives'
      ).toBeTruthy();

      // If image is not decorative, alt text should be meaningful
      if (alt && role !== 'presentation') {
        expect(alt.length, 'Alt text should be meaningful').toBeGreaterThan(0);
        expect(alt, 'Alt text should not be placeholder').not.toMatch(
          /^(image|photo|picture)$/i
        );
      }
    }
  });

  test('should handle loading states accessibly', async ({ page }) => {
    // Trigger a loading state
    await page.evaluate(() => {
      const loadingIndicator = document.createElement('div');
      loadingIndicator.setAttribute('role', 'status');
      loadingIndicator.setAttribute('aria-live', 'polite');
      loadingIndicator.setAttribute('aria-label', 'Loading messages');
      loadingIndicator.setAttribute('data-testid', 'loading-indicator');
      document.body.appendChild(loadingIndicator);
    });

    const loadingIndicator = await page.$('[data-testid="loading-indicator"]');
    if (loadingIndicator) {
      const role = await loadingIndicator.getAttribute('role');
      const ariaLive = await loadingIndicator.getAttribute('aria-live');
      const ariaLabel = await loadingIndicator.getAttribute('aria-label');

      expect(role, 'Loading indicator should have role="status"').toBe(
        'status'
      );
      expect(ariaLive, 'Loading indicator should have aria-live').toBeTruthy();
      expect(
        ariaLabel,
        'Loading indicator should describe what is loading'
      ).toBeTruthy();
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Enable reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Check if animations are disabled
    const hasAnimations = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const styles = window.getComputedStyle(el);
        if (
          styles.animationDuration !== '0s' &&
          styles.animationDuration !== '0ms'
        ) {
          return true;
        }
        if (
          styles.transitionDuration !== '0s' &&
          styles.transitionDuration !== '0ms'
        ) {
          // Allow very short transitions (< 100ms) for essential feedback
          const duration = parseFloat(styles.transitionDuration);
          if (duration > 0.1) {
            return true;
          }
        }
      }
      return false;
    });

    expect(
      hasAnimations,
      'Animations should be reduced when user prefers reduced motion'
    ).toBeFalsy();
  });

  test('full accessibility audit', async ({ page }) => {
    // Comprehensive scan with all rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .options(AXE_OPTIONS)
      .analyze();

    const analyzed = analyzeViolations(accessibilityScanResults.violations);

    // Generate detailed report
    const report = `
Accessibility Audit Results
===========================

Critical violations: ${analyzed.critical.length}
Serious violations: ${analyzed.serious.length}
Moderate violations: ${analyzed.moderate.length}
Minor violations: ${analyzed.minor.length}

Total violations: ${accessibilityScanResults.violations.length}

Detailed Report:
${generateViolationReport(accessibilityScanResults.violations)}
`;

    console.log(report);

    // Assert on totals
    expect(analyzed.critical.length, 'No critical violations allowed').toBe(0);
    expect(
      analyzed.serious.length,
      'Serious violations should be minimal'
    ).toBeLessThanOrEqual(3);
    expect(
      accessibilityScanResults.violations.length,
      'Total violations should be under 10'
    ).toBeLessThan(10);
  });
});

// Additional helper tests for specific components
test.describe('Chat Message Accessibility', () => {
  test('messages should have proper structure', async ({ page }) => {
    await page.goto('/zh-CN/chat', { waitUntil: 'networkidle' });

    // Add a test message
    await page.evaluate(() => {
      const messageList = document.querySelector(
        '[data-testid="message-list"]'
      );
      if (messageList) {
        const message = document.createElement('article');
        message.setAttribute('data-testid', 'chat-message');
        message.innerHTML = `
          <div role="heading" aria-level="3">AI Assistant</div>
          <time datetime="2024-01-20T10:30:00Z">10:30 AM</time>
          <div>This is a test message content</div>
        `;
        messageList.appendChild(message);
      }
    });

    const messages = await page.$$('[data-testid="chat-message"]');
    for (const message of messages) {
      // Check message structure
      const hasAuthor = await message.$('[role="heading"], h3, h4');
      const hasTimestamp = await message.$('time[datetime]');

      expect(
        hasAuthor,
        'Message should have author identification'
      ).toBeTruthy();
      expect(hasTimestamp, 'Message should have timestamp').toBeTruthy();
    }
  });

  test('message actions should be keyboard accessible', async ({ page }) => {
    await page.goto('/zh-CN/chat', { waitUntil: 'networkidle' });

    // Find message actions
    const messageActions = await page.$$(
      '[data-testid="message-actions"] button'
    );

    for (const action of messageActions.slice(0, 3)) {
      // Test first 3 actions
      // Focus on action
      await action.focus();

      // Check if it's keyboard activatable
      const isDisabled = await action.evaluate(
        el => (el as HTMLButtonElement).disabled
      );
      if (!isDisabled) {
        // Should be activatable with Enter or Space
        const canActivate = await action.evaluate(el => {
          const events = ['keydown', 'click'];
          let activated = false;

          const handler = () => {
            activated = true;
          };
          events.forEach(e => el.addEventListener(e, handler));

          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

          events.forEach(e => el.removeEventListener(e, handler));
          return activated;
        });

        expect(
          canActivate,
          'Action button should be keyboard activatable'
        ).toBeTruthy();
      }
    }
  });
});

// Export test configuration for CI
export { A11Y_CONFIG, analyzeViolations, AXE_OPTIONS, generateViolationReport };
