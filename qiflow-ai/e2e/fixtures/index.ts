import { test as base, Page } from '@playwright/test';
export { expect } from '@playwright/test';

// Test data fixtures
export const testUser = {
  birthDate: '1990-01-01',
  birthTime: '12:00',
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isLunar: false,
};

export const testHouse = {
  address: '上海市黄浦区南京东路100号',
  buildYear: 2010,
  orientation: 180, // 南向
  floorPlan: {
    rooms: [
      {
        id: 'living-room',
        name: '客厅',
        type: 'living',
        x: 0,
        y: 0,
        width: 400,
        height: 300,
      },
      {
        id: 'bedroom',
        name: '主卧',
        type: 'bedroom',
        x: 400,
        y: 0,
        width: 300,
        height: 300,
      },
      {
        id: 'kitchen',
        name: '厨房',
        type: 'kitchen',
        x: 0,
        y: 300,
        width: 200,
        height: 200,
      },
    ],
  },
};

export type CompassReading = {
  magnetic: number;
  true: number;
  declination: number;
  accuracy: 'low' | 'medium' | 'high';
};

export const compassReadings: CompassReading = {
  magnetic: 185,
  true: 180,
  declination: -5,
  accuracy: 'high',
};

// Extended test with fixtures
export const test = base.extend<{
  // Page object models
  chatPage: ChatPageObject;
  compassPage: CompassPageObject;

  // Test data
  testUser: typeof testUser;
  testHouse: typeof testHouse;
  compassReadings: typeof compassReadings;
}>({
  testUser: async (_args, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(testUser);
  },

  testHouse: async (_args, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(testHouse);
  },

  compassReadings: async (_args, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(compassReadings);
  },

  chatPage: async ({ page }, use) => {
    const chatPage = new ChatPageObject(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(chatPage);
  },

  compassPage: async ({ page }, use) => {
    const compassPage = new CompassPageObject(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(compassPage);
  },
});

// Page Object Models
class ChatPageObject {
  constructor(private page: Page) {}

  async navigateToChat() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async startGuestSession() {
    await this.page.click('[data-testid="start-guest-session"]');
    await this.page.waitForSelector('[data-testid="chat-interface"]');
  }

  async sendMessage(message: string) {
    await this.page.fill('[data-testid="message-input"]', message);
    await this.page.click('[data-testid="send-button"]');
  }

  async waitForAIResponse() {
    await this.page.waitForSelector('[data-testid="ai-message"]', {
      timeout: 10000,
    });
  }

  async selectRecommendationCard(index: number = 0) {
    await this.page.click(
      `[data-testid="recommendation-card"]:nth-child(${index + 1})`
    );
  }

  async fillBaziForm(userData: typeof testUser) {
    await this.page.fill('[data-testid="birth-date"]', userData.birthDate);
    await this.page.fill('[data-testid="birth-time"]', userData.birthTime);
    await this.page.selectOption('[data-testid="gender"]', userData.gender);
    await this.page.selectOption('[data-testid="timezone"]', userData.timezone);

    if (userData.isLunar) {
      await this.page.check('[data-testid="is-lunar"]');
    }

    await this.page.click('[data-testid="submit-bazi"]');
  }

  async getCurrentState() {
    return await this.page.getAttribute(
      '[data-testid="chat-interface"]',
      'data-state'
    );
  }

  async getLastMessage() {
    const messages = await this.page
      .locator('[data-testid="chat-message"]')
      .all();
    if (messages.length === 0) return null;
    return await messages[messages.length - 1].textContent();
  }

  async getRecommendationCards() {
    return await this.page.locator('[data-testid="recommendation-card"]').all();
  }
}

class CompassPageObject {
  constructor(private page: Page) {}

  async navigateToCompass() {
    await this.page.goto('/compass');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForCompassLoad() {
    await this.page.waitForSelector('[data-testid="compass-container"]');
  }

  async simulateCompassReading(reading: CompassReading) {
    // Simulate device orientation change
    await this.page.evaluate((data: CompassReading) => {
      window.dispatchEvent(
        new CustomEvent('deviceorientation', {
          detail: {
            alpha: data.magnetic,
            beta: 0,
            gamma: 0,
            accuracy: data.accuracy,
          },
        })
      );
    }, reading);
  }

  async getCurrentReading() {
    return await this.page.getAttribute(
      '[data-testid="compass-reading"]',
      'data-value'
    );
  }

  async getCalibratedReading() {
    return await this.page.getAttribute(
      '[data-testid="calibrated-reading"]',
      'data-value'
    );
  }

  async openChatFromCompass() {
    await this.page.click('[data-testid="open-chat-button"]');
    await this.page.waitForSelector('[data-testid="chat-interface"]');
  }

  async getCompassState() {
    return await this.page.getAttribute(
      '[data-testid="compass-container"]',
      'data-state'
    );
  }
}

export { ChatPageObject, CompassPageObject };

