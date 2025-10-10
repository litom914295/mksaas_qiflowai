'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Send, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';

interface FeedbackFormProps {
  analysisId: string;
  onSubmitSuccess?: () => void;
}

const FEEDBACK_TYPES = [
  { value: 'general', label: '一般反馈' },
  { value: 'accuracy', label: '准确性' },
  { value: 'usability', label: '易用性' },
  { value: 'suggestion', label: '建议' },
] as const;

const FEEDBACK_TAGS = [
  { value: 'accurate', label: '准确' },
  { value: 'helpful', label: '有帮助' },
  { value: 'detailed', label: '详细' },
  { value: 'easy-to-understand', label: '易懂' },
  { value: 'professional', label: '专业' },
  { value: 'needs-improvement', label: '需改进' },
] as const;

/**
 * 用户反馈表单组件
 */
export const FeedbackForm = memo(function FeedbackForm({
  analysisId,
  onSubmitSuccess,
}: FeedbackFormProps) {
  const t = useTranslations();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<string>('general');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('请先评分');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/analysis/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId,
          rating,
          feedbackType,
          comment,
          tags: selectedTags,
          wouldRecommend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // 3秒后重置表单
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setComment('');
        setSelectedTags([]);
        setFeedbackType('general');
        setWouldRecommend(5);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('提交反馈失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              感谢您的反馈！
            </h3>
            <p className="text-gray-600">您的宝贵意见将帮助我们持续改进服务</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="space-y-6">
        {/* 标题 */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            分享您的使用体验
          </h3>
          <p className="text-gray-600">您的反馈对我们非常重要</p>
        </div>

        {/* 评分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            整体评分 *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
                aria-label={`${star}星`}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600 self-center">
                {rating === 5
                  ? '非常满意'
                  : rating === 4
                    ? '满意'
                    : rating === 3
                      ? '一般'
                      : rating === 2
                        ? '不满意'
                        : '非常不满意'}
              </span>
            )}
          </div>
        </div>

        {/* 反馈类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            反馈类型
          </label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFeedbackType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  feedbackType === type.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            标签（可多选）
          </label>
          <div className="flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag.value)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* 评论 */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            详细反馈
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="分享您的想法、建议或遇到的问题..."
            className="w-full min-h-32"
            maxLength={1000}
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {comment.length}/1000
          </div>
        </div>

        {/* 推荐指数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            您会向朋友推荐吗？ (1-10)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={wouldRecommend}
              onChange={(e) =>
                setWouldRecommend(Number.parseInt(e.target.value))
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-bold text-blue-600 w-12 text-center">
              {wouldRecommend}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>不太可能</span>
            <span>非常可能</span>
          </div>
        </div>

        {/* 提交按钮 */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full py-3 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              提交中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              提交反馈
            </>
          )}
        </Button>
      </div>
    </Card>
  );
});
