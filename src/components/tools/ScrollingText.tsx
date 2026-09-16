import React, { useEffect, useRef, useState } from 'react';

interface ScrollingTextProps {
    text: string;
    /** Classes appliquées au texte lui-même. */
    className?: string;
    /** Déclenche le défilement (en pratique, le survol de la carte parente). */
    active: boolean;
    /** Plus la valeur est grande, plus le défilement est rapide. */
    speed?: number;
    /** Largeur du dégradé signalant qu'il reste du texte. */
    fadeClassName?: string;
}

/**
 * Texte sur une seule ligne qui défile au survol lorsqu'il est tronqué.
 *
 * Les trois cartes en contenaient chacune une copie, qui lisait `scrollWidth`
 * directement pendant le rendu via `ref.current?.scrollWidth!` — une mesure non
 * fiable (la ref est nulle au premier rendu, et le `?.` suivi de `!` produisait
 * alors `NaN` dans la transformation CSS). Le débordement est désormais mesuré
 * dans un effet, après montage.
 */
const ScrollingText: React.FC<ScrollingTextProps> = ({
    text,
    className = '',
    active,
    speed = 20,
    fadeClassName = 'w-6',
}) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [overflow, setOverflow] = useState(0);

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;
        setOverflow(Math.max(0, element.scrollWidth - element.clientWidth));
    }, [text]);

    const isOverflowing = overflow > 0;
    const isScrolling = isOverflowing && active;

    return (
        <div className="flex-1 min-w-0 relative overflow-hidden">
            <div
                ref={textRef}
                className={`whitespace-nowrap transition-transform ease-linear ${className}`}
                style={{
                    transform: isScrolling ? `translateX(-${overflow}px)` : 'translateX(0)',
                    transitionDuration: isScrolling
                        ? `${Math.max(3, overflow / speed)}s`
                        : '0.3s',
                }}
                title={isOverflowing ? text : undefined}
            >
                {text}
            </div>

            {isOverflowing && !active && (
                <div
                    className={`absolute right-0 top-0 bottom-0 ${fadeClassName} bg-gradient-to-l from-base-100 to-transparent pointer-events-none`}
                />
            )}
        </div>
    );
};

export default ScrollingText;
