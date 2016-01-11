#ifndef __ANIMATIONS_H__
#define __ANIMATIONS_H__

#include <pebble.h>

#define TEXT_ANIMATION_WINDOW_DURATION 40   // Duration of each half of the animation
#define TEXT_ANIMATION_WINDOW_DISTANCE 5    // Pixels the animating text move by
#define TEXT_ANIMATION_WINDOW_INTERVAL 1000 // Interval between timers

typedef struct {
   char *text;
   TextLayer *textLayer;
} TextAnimationData;

void update_text_with_animation(TextLayer *s_text_layer, char *newText);

#endif