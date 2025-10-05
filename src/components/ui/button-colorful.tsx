import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

export function ButtonColorful({
    className,
    label = "Explore Components",
    ...props
}: ButtonColorfulProps) {
    const gradientHue = 180; // Teal base

    return (
        <Button
            className={cn(
                "relative h-10 px-4 overflow-hidden",
                "bg-transparent border-0",
                "transition-all duration-200 ease-out",
                "hover:scale-105 active:scale-95",
                "group",
                className
            )}
            {...props}
        >
            {/* Static gradient background */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(-45deg,
                        hsl(${gradientHue}, 40%, 22%),
                        hsl(${gradientHue + 40}, 42%, 18%),
                        hsl(${gradientHue + 80}, 40%, 22%),
                        hsl(${gradientHue + 120}, 42%, 18%)
                    )`
                }}
            />

            {/* Animated gradient on hover */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                animate={{
                    background: [
                        `linear-gradient(-45deg,
                            hsl(${gradientHue}, 40%, 22%),
                            hsl(${gradientHue + 40}, 42%, 18%),
                            hsl(${gradientHue + 80}, 40%, 22%),
                            hsl(${gradientHue + 120}, 42%, 18%)
                        )`,
                        `linear-gradient(-45deg,
                            hsl(${gradientHue + 40}, 42%, 18%),
                            hsl(${gradientHue + 80}, 40%, 22%),
                            hsl(${gradientHue + 120}, 42%, 18%),
                            hsl(${gradientHue}, 40%, 22%)
                        )`,
                        `linear-gradient(-45deg,
                            hsl(${gradientHue + 80}, 40%, 22%),
                            hsl(${gradientHue + 120}, 42%, 18%),
                            hsl(${gradientHue}, 40%, 22%),
                            hsl(${gradientHue + 40}, 42%, 18%)
                        )`,
                        `linear-gradient(-45deg,
                            hsl(${gradientHue}, 40%, 22%),
                            hsl(${gradientHue + 40}, 42%, 18%),
                            hsl(${gradientHue + 80}, 40%, 22%),
                            hsl(${gradientHue + 120}, 42%, 18%)
                        )`
                    ]
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-10 group-hover:opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2 z-10">
                <span className="text-white">{label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/90" />
            </div>
        </Button>
    );
}
