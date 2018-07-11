import Vue from 'vue';

import analogClock from './analog-clock.vue';
import menu from './menu.vue';
import noteHeader from './note-header.vue';
import signin from './signin.vue';
import signup from './signup.vue';
import forkit from './forkit.vue';
import acct from './acct.vue';
import avatar from './avatar.vue';
import nav from './nav.vue';
import misskeyFlavoredMarkdown from './misskey-flavored-markdown';
import poll from './poll.vue';
import pollEditor from './poll-editor.vue';
import reactionIcon from './reaction-icon.vue';
import reactionsViewer from './reactions-viewer.vue';
import time from './time.vue';
import timer from './timer.vue';
import mediaList from './media-list.vue';
import uploader from './uploader.vue';
import specialMessage from './special-message.vue';
import streamIndicator from './stream-indicator.vue';
import ellipsis from './ellipsis.vue';
import messaging from './messaging.vue';
import messagingRoom from './messaging-room.vue';
import urlPreview from './url-preview.vue';
import twitterSetting from './twitter-setting.vue';
import fileTypeIcon from './file-type-icon.vue';
import Switch from './switch.vue';
import Reversi from './games/reversi/reversi.vue';
import welcomeTimeline from './welcome-timeline.vue';
import uiInput from './ui/input.vue';
import uiButton from './ui/button.vue';
import uiCard from './ui/card.vue';
import uiForm from './ui/form.vue';
import uiTextarea from './ui/textarea.vue';
import uiSwitch from './ui/switch.vue';
import uiRadio from './ui/radio.vue';
import uiSelect from './ui/select.vue';

Vue.component('mk-analog-clock', analogClock);
Vue.component('mk-menu', menu);
Vue.component('mk-note-header', noteHeader);
Vue.component('mk-signin', signin);
Vue.component('mk-signup', signup);
Vue.component('mk-forkit', forkit);
Vue.component('mk-acct', acct);
Vue.component('mk-avatar', avatar);
Vue.component('mk-nav', nav);
Vue.component('misskey-flavored-markdown', misskeyFlavoredMarkdown);
Vue.component('mk-poll', poll);
Vue.component('mk-poll-editor', pollEditor);
Vue.component('mk-reaction-icon', reactionIcon);
Vue.component('mk-reactions-viewer', reactionsViewer);
Vue.component('mk-time', time);
Vue.component('mk-timer', timer);
Vue.component('mk-media-list', mediaList);
Vue.component('mk-uploader', uploader);
Vue.component('mk-special-message', specialMessage);
Vue.component('mk-stream-indicator', streamIndicator);
Vue.component('mk-ellipsis', ellipsis);
Vue.component('mk-messaging', messaging);
Vue.component('mk-messaging-room', messagingRoom);
Vue.component('mk-url-preview', urlPreview);
Vue.component('mk-twitter-setting', twitterSetting);
Vue.component('mk-file-type-icon', fileTypeIcon);
Vue.component('mk-switch', Switch);
Vue.component('mk-reversi', Reversi);
Vue.component('mk-welcome-timeline', welcomeTimeline);
Vue.component('ui-input', uiInput);
Vue.component('ui-button', uiButton);
Vue.component('ui-card', uiCard);
Vue.component('ui-form', uiForm);
Vue.component('ui-textarea', uiTextarea);
Vue.component('ui-switch', uiSwitch);
Vue.component('ui-radio', uiRadio);
Vue.component('ui-select', uiSelect);
