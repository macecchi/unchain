#include <pebble.h>
#include "progress_layer.h"
#include "animations.h"

#define PROGRESS_LAYER_WINDOW_DELTA 33
#define PROGRESS_LAYER_WINDOW_WIDTH 80

enum {
	APP_KEY_ACTION = 0,
	APP_KEY_STATUS = 1,
	APP_KEY_STATE = 2
};

typedef enum {
	MAC_STATE_UNKNOWN,
	MAC_STATE_LOCKED,
    MAC_STATE_UNLOCKED
} MacState;


static void progress_callback(void *context);

static MacState macState = MAC_STATE_UNKNOWN;
static Window *window;
static TextLayer *text_layer;
static GBitmap *locked_bitmap;
static GBitmap *unlocked_bitmap;
static BitmapLayer *locked_bitmap_layer;
static BitmapLayer *unlocked_bitmap_layer;
static ProgressLayer *s_progress_layer;
static AppTimer *s_timer;
static int s_progress;


// State handling

static void update_state(MacState state) {
    macState = state;
    
    Layer *window_layer = window_get_root_layer(window);
    layer_remove_from_parent(s_progress_layer);
       
    if (state == MAC_STATE_UNLOCKED) {
        APP_LOG(APP_LOG_LEVEL_DEBUG, "Mac is unlocked.");
        update_text_with_animation(text_layer, "UNLOCKED");
        layer_remove_from_parent(bitmap_layer_get_layer(locked_bitmap_layer));
        layer_add_child(window_layer, bitmap_layer_get_layer(unlocked_bitmap_layer));
        window_set_background_color(window, GColorGreen);
    }
    else if (state == MAC_STATE_LOCKED) {
        APP_LOG(APP_LOG_LEVEL_DEBUG, "Mac is locked.");
        update_text_with_animation(text_layer, "LOCKED");
        layer_remove_from_parent(bitmap_layer_get_layer(unlocked_bitmap_layer));
        layer_add_child(window_layer, bitmap_layer_get_layer(locked_bitmap_layer));
        window_set_background_color(window, GColorRed);
    }
}


// Message handling

static void send_message(char* message) {
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);

	Tuplet value = TupletCString(APP_KEY_ACTION, message);
	dict_write_tuplet(iter, &value);

	app_message_outbox_send();
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
	Tuple *status = dict_find(iter, APP_KEY_STATUS);
	if (status) {
		if (strcmp(status->value->cstring, "ok") == 0) {
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Received OK message.");
		}    
	}

	Tuple *state = dict_find(iter, APP_KEY_STATE);
	if (state) {
		if (strcmp(state->value->cstring, "unlocked") == 0) {
			update_state(MAC_STATE_UNLOCKED);
		}
        else if (strcmp(state->value->cstring, "locked") == 0) {
			update_state(MAC_STATE_LOCKED);
		}
	}
}


// Progress bar handling

static void next_timer() {
  s_timer = app_timer_register(PROGRESS_LAYER_WINDOW_DELTA, progress_callback, NULL);
}

static void progress_callback(void *context) {
  s_progress += (s_progress < 100) ? 1 : -100;
  progress_layer_set_progress(s_progress_layer, s_progress);
  next_timer();
}


// Button handling

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
    if (macState == MAC_STATE_LOCKED) {
        send_message("unlock");
    }
    else {
        send_message("lock");
    }
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
}

static void click_config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
	window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
	window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}


// Window handling

static void window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_bounds(window_layer);
    
    locked_bitmap = gbitmap_create_with_resource(RESOURCE_ID_LOCKED_IMAGE);
    unlocked_bitmap = gbitmap_create_with_resource(RESOURCE_ID_UNLOCKED_IMAGE);
    
    s_progress_layer = progress_layer_create(GRect((bounds.size.w - PROGRESS_LAYER_WINDOW_WIDTH) / 2, 80, PROGRESS_LAYER_WINDOW_WIDTH, 6));
    progress_layer_set_progress(s_progress_layer, 0);
    progress_layer_set_corner_radius(s_progress_layer, 2);
    progress_layer_set_foreground_color(s_progress_layer, GColorWhite);
    progress_layer_set_background_color(s_progress_layer, GColorBlack);
    layer_add_child(window_layer, s_progress_layer);

    GRect image_rect = GRect(bounds.size.w/2 - 49/2, 35, 49, 68);
    locked_bitmap_layer = bitmap_layer_create(image_rect);
    bitmap_layer_set_bitmap(locked_bitmap_layer, locked_bitmap);
    bitmap_layer_set_compositing_mode(locked_bitmap_layer, GCompOpSet);
    unlocked_bitmap_layer = bitmap_layer_create(image_rect);
    bitmap_layer_set_bitmap(unlocked_bitmap_layer, unlocked_bitmap);
    bitmap_layer_set_compositing_mode(unlocked_bitmap_layer, GCompOpSet);

	text_layer = text_layer_create((GRect) { .origin = { 0, 110 }, .size = { bounds.size.w, 35 } });
	text_layer_set_text(text_layer, "Finding Mac...");
	text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
	text_layer_set_font(text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
    text_layer_set_background_color(text_layer, GColorClear);
	layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
	text_layer_destroy(text_layer);
    gbitmap_destroy(locked_bitmap);
    gbitmap_destroy(unlocked_bitmap);
    bitmap_layer_destroy(locked_bitmap_layer);
    bitmap_layer_destroy(unlocked_bitmap_layer);
    progress_layer_destroy(s_progress_layer);
}

static void window_appear(Window *window) {
  s_progress = 0;
  next_timer();
}

static void window_disappear(Window *window) {
  if(s_timer) {
    app_timer_cancel(s_timer);
    s_timer = NULL;
  }
}


// Initialisation

static void init(void) {
	window = window_create();
    window_set_background_color(window, GColorChromeYellow);
	window_set_click_config_provider(window, click_config_provider);
	window_set_window_handlers(window, (WindowHandlers) {
		.load = window_load,
        .appear = window_appear,
        .disappear = window_disappear,
		.unload = window_unload
	});
	const bool animated = true;
	window_stack_push(window, animated);

	app_message_register_inbox_received(in_received_handler);
	app_message_open(256, 256);
}

static void deinit(void) {
	window_destroy(window);
}

int main(void) {
	init();

	APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

	app_event_loop();
	deinit();
}
