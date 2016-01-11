#include <pebble.h>
#include "animations.h"

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

static MacState macState = MAC_STATE_UNKNOWN;
static Window *window;
static TextLayer *text_layer;


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
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Mac is unlocked.");
            update_text_with_animation(text_layer, "UNLOCKED");
            macState = MAC_STATE_UNLOCKED;
		}
        else if (strcmp(state->value->cstring, "locked") == 0) {
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Mac is locked.");
            update_text_with_animation(text_layer, "LOCKED");
            macState = MAC_STATE_LOCKED;
		}
	}
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

	text_layer = text_layer_create((GRect) { .origin = { 0, 115 }, .size = { bounds.size.w, 35 } });
	text_layer_set_text(text_layer, "Connecting...");
	text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
	text_layer_set_font(text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
    text_layer_set_background_color(text_layer, GColorClear);
	layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
	text_layer_destroy(text_layer);
}


// Initialisation

static void init(void) {
	window = window_create();
    window_set_background_color(window, GColorChromeYellow);
	window_set_click_config_provider(window, click_config_provider);
	window_set_window_handlers(window, (WindowHandlers) {
		.load = window_load,
		.unload = window_unload,
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
