/**
 * Reusable UI Components
 */

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
}

export function LoadingCard({ message = "Loading..." }: LoadingCardProps) {
  return (
    <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
      <CardContent className="text-center py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

interface ErrorCardProps {
  error: Error | string;
  onRetry?: () => void;
}

export function ErrorCard({ error, onRetry }: ErrorCardProps) {
  const message = typeof error === "string" ? error : error.message;

  return (
    <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
      <CardContent className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <p className="text-sm font-medium text-destructive mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="glass-card dark:glass-card-dark border-0 shadow-lg">
      <CardContent className="text-center py-12">
        {icon && <div className="mx-auto mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}

interface ErrorAlertProps {
  error: Error | string | null;
  className?: string;
}

export function ErrorAlert({ error, className = "" }: ErrorAlertProps) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
