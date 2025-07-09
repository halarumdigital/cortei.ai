import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { useQuery } from "@tanstack/react-query";

interface TourStep {
  id: number;
  title: string;
  description: string;
  targetElement: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  stepOrder: number;
}

function TourContent({ tourSteps, closeTour }: { tourSteps: TourStep[], closeTour: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [clickHandler, setClickHandler] = useState<(() => void) | null>(null);

  // Use default tour color for now - will be configurable once schema sync is complete
  const tourColor = '#b845dc';

  // Update tour progress
  const updateProgress = async (stepIndex: number) => {
    try {
      await fetch('/api/company/tour/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: stepIndex,
          completed: stepIndex >= tourSteps.length - 1
        })
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso do tour:', error);
    }
  };

  // Handle element click to advance tour
  const handleElementClick = (e: Event) => {
    console.log('🎯 Tour: Element clicked, advancing to next step');
    
    // Don't prevent default behavior - let the click work normally
    // Just advance the tour after a small delay
    setTimeout(() => {
      handleNext();
    }, 100);
  };

  // Cleanup function to remove all tour highlights
  const cleanupAllHighlights = () => {
    // Remove all existing tour highlights from any element
    const allHighlighted = document.querySelectorAll('.tour-highlighted');
    allHighlighted.forEach((el) => {
      const element = el as HTMLElement;
      element.style.removeProperty('background-color');
      element.style.removeProperty('position');
      element.style.removeProperty('z-index');
      element.style.removeProperty('animation');
      element.style.removeProperty('border-radius');
      element.style.removeProperty('transition');
      element.classList.remove('tour-highlighted');
    });
  };

  // Highlight target element with click functionality
  useEffect(() => {
    // Always cleanup first
    cleanupAllHighlights();
    
    if (tourSteps.length > 0 && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.targetElement) as HTMLElement;
      
      if (element) {
        // Remove previous click handler if exists
        if (highlightedElement && clickHandler) {
          highlightedElement.removeEventListener('click', clickHandler, true);
        }

        // Set dynamic tour color in CSS variable
        document.documentElement.style.setProperty('--tour-color', tourColor);
        
        // Clear any existing styles first
        element.style.removeProperty('box-shadow');
        element.style.removeProperty('position');
        element.style.removeProperty('z-index');
        element.style.removeProperty('animation');
        element.style.removeProperty('outline');
        element.style.removeProperty('outline-offset');
        element.classList.remove('tour-highlighted');
        
        // Apply only background color highlighting
        element.style.setProperty('background-color', tourColor, 'important');
        element.style.setProperty('position', 'relative', 'important');
        element.style.setProperty('z-index', '10000', 'important');
        element.style.setProperty('border-radius', '8px', 'important');
        element.style.setProperty('transition', 'all 0.3s ease', 'important');
        
        // Add pulsing animation
        element.style.setProperty('animation', 'tour-color-blink 1.5s infinite ease-in-out', 'important');
        
        // Add CSS class for additional styling
        element.classList.add('tour-highlighted');
        
        // Element successfully highlighted
        
        // Add click listener to detect clicks
        const handler = (e: Event) => handleElementClick(e);
        element.addEventListener('click', handler, false);
        setClickHandler(() => handler);
        setHighlightedElement(element);

        // Scroll to element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      // Cleanup current element click handler
      if (highlightedElement && clickHandler) {
        highlightedElement.removeEventListener('click', clickHandler, true);
      }
      
      // Always cleanup all highlights on step change
      cleanupAllHighlights();
      
      // Remove click indicator
      const existingIndicator = document.getElementById('tour-click-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }
    };
  }, [currentStep, tourSteps]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAllHighlights();
    };
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateProgress(nextStep);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateProgress(prevStep);
    }
  };

  const handleFinish = async () => {
    await updateProgress(tourSteps.length);
    
    // Clean up all tour visual elements
    cleanupAllHighlights();
    
    // Remove click indicator
    const existingIndicator = document.getElementById('tour-click-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    closeTour();
  };

  if (tourSteps.length === 0) {
    return null;
  }

  const currentTourStep = tourSteps[currentStep];
  if (!currentTourStep) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <Card className="w-80 pointer-events-auto shadow-2xl border-2 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            Tour Guiado ({currentStep + 1}/{tourSteps.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFinish}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-lg mb-2">
              {currentTourStep.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              {currentTourStep.description}
            </p>
            
            {/* Clear instruction for user action */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-sm">
                  👆 Clique no elemento destacado na tela para continuar
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex space-x-1">
              {tourSteps.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === tourSteps.length - 1 ? (
                'Finalizar'
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function GuidedTour() {
  const { showTour, closeTour, tourSteps = [] } = useGuidedTour();

  if (!showTour || tourSteps.length === 0) {
    return null;
  }

  return <TourContent tourSteps={tourSteps} closeTour={closeTour} />;
}