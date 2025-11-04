import { toast } from 'sonner';
export { toast } from 'sonner';

// 简化的 toast hook，兼容原有代码
export const useToast = () => {
  return {
    toast: (props: any) => {
      if (typeof props === 'string') {
        toast(props);
      } else {
        const { title, description, variant = 'default' } = props;
        if (variant === 'destructive') {
          toast.error(title, { description });
        } else {
          toast(title, { description });
        }
      }
    },
  };
};
