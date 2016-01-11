#include "animations.h"

static void out_stopped_handler(Animation *animation, bool finished, void *context) {
  TextAnimationData *data = (TextAnimationData *)context;
  char *newText = data->text;
  TextLayer *s_text_layer = data->textLayer;
  free(data);
  
  text_layer_set_text(s_text_layer, newText);

  Layer *text_layer = text_layer_get_layer(s_text_layer);
  GRect frame = layer_get_frame(text_layer);
  GRect start = GRect(frame.origin.x + (2 * TEXT_ANIMATION_WINDOW_DISTANCE), frame.origin.y, frame.size.w, frame.size.h);
  GRect finish = GRect(frame.origin.x + TEXT_ANIMATION_WINDOW_DISTANCE, frame.origin.y, frame.size.w, frame.size.h);

  PropertyAnimation *in_prop_anim = property_animation_create_layer_frame(text_layer, &start, &finish);
  Animation *in_anim = property_animation_get_animation(in_prop_anim);
  animation_set_curve(in_anim, AnimationCurveEaseInOut);
  animation_set_duration(in_anim, TEXT_ANIMATION_WINDOW_DURATION);
  animation_schedule(in_anim);
}

void update_text_with_animation(TextLayer *s_text_layer, char *newText) {
  TextAnimationData *data = (TextAnimationData *)malloc(sizeof(TextAnimationData));
  data->text = newText;
  data->textLayer = s_text_layer;
  
  Layer *text_layer = text_layer_get_layer(s_text_layer);
  GRect start = layer_get_frame(text_layer);
  GRect finish = GRect(start.origin.x - TEXT_ANIMATION_WINDOW_DISTANCE, start.origin.y, start.size.w, start.size.h);

  PropertyAnimation *out_prop_anim = property_animation_create_layer_frame(text_layer, &start, &finish);
  Animation *out_anim = property_animation_get_animation(out_prop_anim);
  animation_set_curve(out_anim, AnimationCurveEaseInOut);
  animation_set_duration(out_anim, TEXT_ANIMATION_WINDOW_DURATION);
  animation_set_handlers(out_anim, (AnimationHandlers) {
    .stopped = out_stopped_handler
  }, (void *)data);
  animation_schedule(out_anim);
}