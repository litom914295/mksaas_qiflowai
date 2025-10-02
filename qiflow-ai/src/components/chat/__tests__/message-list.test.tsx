import { fireEvent, render, screen } from '@testing-library/react';
import { ConversationMessageList } from '../message-list';

describe('ConversationMessageList', () => {
  it('renders empty state when no messages provided', () => {
    render(<ConversationMessageList messages={[]} />);

    expect(screen.getByText(/\u5927\u5e08/)).toBeInTheDocument();
  });

  it('renders messages with metadata and favorite controls', () => {
    const toggleFavorite = jest.fn();
    const messages = [
      {
        id: 'assistant-1',
        role: 'assistant' as const,
        content:
          'AI \u5927\u5e08\u7684\u5206\u6790\u7ed3\u679c\u5df2\u51fa\u6765\u3002',
        timestamp: '2024-01-01T08:00:00.000Z',
        metadata: {
          analysisType: 'integrated',
        },
      },
      {
        id: 'user-1',
        role: 'user' as const,
        content: '\u4e0a\u4f205\u6a13\u623f\u5c4b\u5e73\u9762\u56fe\u3002',
        timestamp: '2024-01-01T08:05:00.000Z',
        metadata: {
          attachments: ['floor-plan.jpg', 'orientation.png'],
        },
      },
    ];

    render(
      <ConversationMessageList
        messages={messages as any}
        favoriteMessageIds={['assistant-1']}
        onToggleFavorite={toggleFavorite}
      />
    );

    expect(screen.getByText('AI \u5927\u5e08')).toBeInTheDocument();
    expect(screen.getByText('\u6211')).toBeInTheDocument();
    expect(screen.getByText(/floor-plan\.jpg/)).toBeInTheDocument();
    expect(screen.getByText('\u7efc\u5408\u5efa\u8bae')).toBeInTheDocument();

    const favoritedButton = screen.getByLabelText('\u53d6\u6d88\u6536\u85cf');
    const star = String.fromCharCode(0x2605);
    expect(favoritedButton).toHaveTextContent(star);

    const regularButton = screen.getByLabelText('\u6536\u85cf\u6d88\u606f');
    fireEvent.click(regularButton);
    expect(toggleFavorite).toHaveBeenCalledWith('user-1');
  });
});
