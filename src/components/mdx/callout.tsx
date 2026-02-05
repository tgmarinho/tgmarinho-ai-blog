import { cn } from "@/lib/utils";
import { AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";

type CalloutType = "info" | "warning" | "error" | "success";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  { icon: React.ElementType; className: string }
> = {
  info: {
    icon: Info,
    className: "border-blue-500/50 bg-blue-500/10",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-500/50 bg-yellow-500/10",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/50 bg-red-500/10",
  },
  success: {
    icon: CheckCircle,
    className: "border-green-500/50 bg-green-500/10",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border p-4",
        config.className
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
