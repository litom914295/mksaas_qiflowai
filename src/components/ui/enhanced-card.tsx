import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { colors } from "@/lib/design/design-tokens"

// Card variant configuration - based on design system
const cardVariants = cva(
  // Base styles 
  "relative overflow-hidden transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "rounded-lg border bg-white text-gray-900 shadow-sm hover:shadow-md",
        elevated: "rounded-xl border-0 bg-white text-gray-900 shadow-lg hover:shadow-xl",
        outlined: "rounded-lg border-2 bg-transparent text-gray-900 hover:border-primary-300",
        cultural: "rounded-xl border bg-gradient-to-br from-white to-amber-50 text-gray-900 shadow-lg hover:shadow-xl",
        'feng-shui': `
          rounded-xl border-0 shadow-lg backdrop-blur-sm
          bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20
          before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r 
          before:from-blue-500 before:via-purple-500 before:to-amber-500
          hover:shadow-2xl hover:scale-[1.02]
        `,
        glass: `
          rounded-xl backdrop-blur-md bg-white/80 border border-white/20 shadow-2xl
          supports-[backdrop-filter]:bg-white/60 hover:bg-white/90
        `,
        gradient: `
          rounded-xl border-0 bg-gradient-to-br from-primary-50/50 via-purple-50/30 to-pink-50/20
          shadow-lg backdrop-blur-sm hover:shadow-xl
        `
      },
      size: {
        sm: "p-4",
        md: "p-6", 
        lg: "p-8",
        xl: "p-10"
      },
      interactive: {
        true: "cursor-pointer active:scale-[0.98]",
        false: ""
      },
      culturalElement: {
        wood: "border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white hover:from-green-100/50",
        fire: "border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-white hover:from-red-100/50", 
        earth: "border-l-4 border-l-yellow-600 bg-gradient-to-br from-yellow-50/50 to-white hover:from-yellow-100/50",
        metal: "border-l-4 border-l-gray-500 bg-gradient-to-br from-gray-50/50 to-white hover:from-gray-100/50",
        water: "border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-100/50",
        none: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md", 
      interactive: false,
      culturalElement: "none"
    }
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  hover?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, culturalElement, element, hover = true, ...props }, ref) => {
    // Map element to culturalElement for backward compatibility
    const mappedCulturalElement = element || culturalElement || 'none';
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ 
            variant, 
            size, 
            interactive: interactive ?? hover, 
            culturalElement: mappedCulturalElement 
          }), 
          className
        )}
        {...props}
      >
        {props.children}
      </div>
    )
  }
)
Card.displayName = "Card"

// ==================== Card Header ====================
const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      size: {
        sm: "p-4 pb-2",
        md: "p-6 pb-3",
        lg: "p-8 pb-4",
        xl: "p-10 pb-5"
      },
      centered: {
        true: "text-center items-center",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      centered: false
    }
  }
)

export interface CardHeaderProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, centered, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ size, centered }), className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

// ==================== Card Title ====================
const cardTitleVariants = cva(
  "font-semibold leading-none tracking-tight",
  {
    variants: {
      size: {
        sm: "text-lg",
        md: "text-xl", 
        lg: "text-2xl",
        xl: "text-3xl"
      },
      gradient: {
        none: "",
        primary: "bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent",
        cultural: "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent",
        element: "text-gray-800"
      }
    },
    defaultVariants: {
      size: "md",
      gradient: "none"
    }
  }
)

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, gradient, as: Comp = 'h3', children, ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn(cardTitleVariants({ size, gradient }), className)}
      {...props}
    >
      {children}
    </Comp>
  )
)
CardTitle.displayName = "CardTitle"

// ==================== Card Description ====================
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// ==================== Card Content ====================
const cardContentVariants = cva(
  "",
  {
    variants: {
      size: {
        sm: "p-4 pt-0",
        md: "p-6 pt-0",
        lg: "p-8 pt-0", 
        xl: "p-10 pt-0"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ size }), className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

// ==================== Card Footer ====================
const cardFooterVariants = cva(
  "flex items-center",
  {
    variants: {
      size: {
        sm: "p-4 pt-0",
        md: "p-6 pt-0",
        lg: "p-8 pt-0",
        xl: "p-10 pt-0"
      },
      justify: {
        start: "justify-start",
        center: "justify-center", 
        end: "justify-end",
        between: "justify-between",
        around: "justify-around"
      }
    },
    defaultVariants: {
      size: "md",
      justify: "start"
    }
  }
)

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, justify, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ size, justify }), className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// ==================== Special Card Components ====================

// 文化主题卡片
export interface CulturalCardProps extends CardProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

const CulturalCard = React.forwardRef<HTMLDivElement, CulturalCardProps>(
  ({ element = 'wood', icon, title, description, children, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="cultural"
        culturalElement={element}
        className={cn('group', className)}
        {...props}
      >
        {(icon || title || description) && (
          <CardHeader>
            {icon && (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/60 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-200">
                {icon}
              </div>
            )}
            {title && (
              <CardTitle size="lg" className="text-gray-800">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-gray-600">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        {children && <CardContent>{children}</CardContent>}
      </Card>
    );
  }
)
CulturalCard.displayName = 'CulturalCard'

// 统计卡片
export interface StatCardProps extends CardProps {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, change, icon, color = 'primary', className, ...props }, ref) => {
    const colorClasses = {
      primary: 'border-blue-200 bg-blue-50',
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      error: 'border-red-200 bg-red-50'
    };

    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn('p-6', colorClasses[color], className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.trend === 'up' && 'text-green-600',
                    change.trend === 'down' && 'text-red-600',
                    change.trend === 'neutral' && 'text-gray-600'
                  )}
                >
                  {change.trend === 'up' && '↗'}
                  {change.trend === 'down' && '↘'}
                  {change.trend === 'neutral' && '→'}
                  {change.value}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              'flex items-center justify-center w-12 h-12 rounded-lg',
              color === 'primary' && 'bg-blue-100 text-blue-600',
              color === 'success' && 'bg-green-100 text-green-600',
              color === 'warning' && 'bg-yellow-100 text-yellow-600',
              color === 'error' && 'bg-red-100 text-red-600'
            )}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
)
StatCard.displayName = 'StatCard'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CulturalCard, StatCard }