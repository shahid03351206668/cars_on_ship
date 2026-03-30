import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface DashboardWidgetProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
}

export function DashboardWidget({
    title,
    value,
    subtitle,
    icon: Icon,
}: DashboardWidgetProps) {
    return (
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="w-5 h-5 text-primary" />
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}