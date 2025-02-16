import dotenv from "dotenv";
import { NotificationResponse, TweetResponse } from "./types";
import { generateCt0, getTokens, sleep } from "./utils";
import { reply } from "./reply";

dotenv.config();

const AUTH_TOKEN = process.env.AUTH_TOKEN;

const NOTIFICATIONS_BASE_URL = "https://x.com/i/api/2/notifications/all.json";

const NOTIFICATION_PARAMS = {
  include_profile_interstitial_type: "1",
  include_blocking: "1",
  include_blocked_by: "1",
  include_followed_by: "1",
  include_want_retweets: "1",
  include_mute_edge: "1",
  include_can_dm: "1",
  include_can_media_tag: "1",
  include_ext_is_blue_verified: "1",
  include_ext_verified_type: "1",
  include_ext_profile_image_shape: "1",
  skip_status: "1",
  cards_platform: "Web-12",
  include_cards: "1",
  include_ext_alt_text: "true",
  include_ext_limited_action_results: "true",
  include_quote_count: "true",
  include_reply_count: "1",
  tweet_mode: "extended",
  include_ext_views: "true",
  include_entities: "true",
  include_user_entities: "true",
  include_ext_media_color: "true",
  include_ext_media_availability: "true",
  include_ext_sensitive_media_warning: "true",
  include_ext_trusted_friends_metadata: "true",
  send_error_codes: "true",
  simple_quoted_tweet: "true",
  count: "10",
  requestContext: "launch",
  ext: "mediaStats,highlightedLabel,parodyCommentaryFanLabel,voiceInfo,birdwatchPivot,superFollowMetadata,unmentionInfo,editControl,article"
};

const TWEET_DETAILS_BASE_URL = "https://x.com/i/api/graphql/Ez6kRPyXbqNlhBwcNMpU-Q/TweetDetail";

const TWEET_DETAILS_VARIABLES = {
  referrer: "profile",
  controller_data: "DAACDAABDAABCgABAAAAAAAAAAAKAAkQhS156dVQAAAAAAA=",
  with_rux_injections: false,
  rankingMode: "Relevance",
  includePromotedContent: true,
  withCommunity: true,
  withQuickPromoteEligibilityTweetFields: true,
  withBirdwatchNotes: true,
  withVoice: true
};

const TWEET_DETAILS_FEATURES = {
  profile_label_improvements_pcf_label_in_post_enabled: true,
  rweb_tipjar_consumption_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_jetfuel_frame: false,
  responsive_web_grok_share_attachment_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  responsive_web_grok_analysis_button_from_backend: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  rweb_video_timestamps_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  responsive_web_grok_image_annotation_enabled: false,
  responsive_web_enhance_cards_enabled: false
};

const TWEET_DETAILS_FIELD_TOGGLES = {
  withArticleRichContentState: true,
  withArticlePlainText: false,
  withGrokAnalyze: false,
  withDisallowedReplyControls: false
};

const POST_TWEET_BASE_URL = "https://x.com/i/api/graphql/UYy4T67XpYXgWKOafKXB_A/CreateTweet";

const POST_TWEET_FEATURES = {
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_jetfuel_frame: false,
  responsive_web_grok_share_attachment_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  responsive_web_grok_analysis_button_from_backend: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  rweb_tipjar_consumption_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  articles_preview_enabled: true,
  rweb_video_timestamps_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  responsive_web_grok_image_annotation_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_enhance_cards_enabled: false
};

export const initializeMonitor = async (): Promise<void> => {
  const tokens = await getTokens();
  const previousNotifications: string[] = [];

  const resp = await fetchNotifications();
  if (!resp) return; 

  for (const instruction of resp?.timeline.instructions) {
    if (!instruction.addEntries) continue
    for (const entry of instruction.addEntries.entries) {
      if (entry.content.item) {
        if (entry.content.item.content.tweet) {
          if (entry.content.item.content.tweet.displayType !== "Tweet") continue
          previousNotifications.push(entry.content.item.content.tweet.id);
        }
      }
    }
  }

  console.log("initialized notis", previousNotifications)

  let i = 1;
  while(true) {
    await sleep(10000);
    let newNotifications: string[] = []
    const resp = await fetchNotifications();
    if (!resp) continue

    for (const instruction of resp?.timeline.instructions) {
      if (!instruction.addEntries) continue
      for (const entry of instruction.addEntries.entries) {
        if (entry.content.item) {
          if (entry.content.item.content.tweet) {
            if (entry.content.item.content.tweet.displayType !== "Tweet") continue
            if (!previousNotifications.includes(entry.content.item.content.tweet.id)) {
              previousNotifications.push(entry.content.item.content.tweet.id);
              newNotifications.push(entry.content.item.content.tweet.id)
            }
          }
        }
      }
    }

    for (const notification of newNotifications) {
      await reply(notification, tokens[i], generateCt0());
    }

    newNotifications = [];

    i = (i + 1) % tokens.length;
  }
}

const fetchNotifications = async(): Promise<NotificationResponse | null> => {
  try {
    const ct0 = generateCt0()
    const response = await fetch(`${NOTIFICATIONS_BASE_URL}?${new URLSearchParams(NOTIFICATION_PARAMS)}`, {
      headers: { 
        "Accept": "*/*",
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "Cookie": `auth_token=${AUTH_TOKEN}; ct0=${ct0}`,
        "X-Csrf-Token": ct0
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
}

export const fetchTweet = async(id: string, auth_token: string, ct0: string): Promise<TweetResponse | null> => {
  try {
    const params = new URLSearchParams({
      variables: JSON.stringify({ ...TWEET_DETAILS_VARIABLES, focalTweetId: id }),
      features: JSON.stringify(TWEET_DETAILS_FEATURES),
      fieldToggles: JSON.stringify(TWEET_DETAILS_FIELD_TOGGLES)
    });

    const response = await fetch(`${TWEET_DETAILS_BASE_URL}?${params}`, {
      headers: { 
        "Accept": "*/*",
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "Cookie": `auth_token=${auth_token}; ct0=${ct0}`,
        "X-Csrf-Token": ct0
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tweet:", error);
    return null;
  }
}
export const fetchQuotedTweetsText = async(id: string, auth_token: string, ct0: string): Promise<[string, string, string] | null> => {
  let resp = await fetchTweet(id, auth_token, ct0);
  if (!resp) return null;

  let quotedTweet = "";
  for (const instruction of resp.data.threaded_conversation_with_injections_v2.instructions) {
    if (instruction.type !== "TimelineAddEntries" || !instruction.entries) continue
    for (const entry of instruction.entries) {
      if (!entry.content.itemContent || entry.content.itemContent.tweet_results.result.rest_id !== id) continue
      quotedTweet = entry.content.itemContent.tweet_results.result.legacy.in_reply_to_status_id_str;
      break
    }
  }
  if (quotedTweet === "") return null;

  resp = await fetchTweet(quotedTweet, auth_token, ct0);
  if (!resp) return null;

  let quotedQuotedTweet = "";
  let text2 = "";

  for (const instruction of resp?.data.threaded_conversation_with_injections_v2.instructions) {
    if (instruction.type !== "TimelineAddEntries" || !instruction.entries) continue
    for (const entry of instruction.entries) {
      if (!entry.content.itemContent || entry.content.itemContent.tweet_results.result.rest_id !== quotedTweet) continue
      quotedQuotedTweet = entry.content.itemContent.tweet_results.result.legacy.in_reply_to_status_id_str;
      text2 =  entry.content.itemContent.tweet_results.result.legacy.full_text;
      break;
    }
  }
  if (quotedQuotedTweet === "") return null;

  resp = await fetchTweet(quotedQuotedTweet, auth_token, ct0);
  if (!resp) return null;

  let text1 = "";

  for (const instruction of resp?.data.threaded_conversation_with_injections_v2.instructions) {
    if (instruction.type !== "TimelineAddEntries" || !instruction.entries) continue
    for (const entry of instruction.entries) {
      if (!entry.content.itemContent || entry.content.itemContent.tweet_results.result.rest_id !== quotedQuotedTweet) continue
      text1 = entry.content.itemContent.tweet_results.result.legacy.full_text;
      break;
    }
  }

  return [quotedTweet, text1, text2];
}

export const createTweet = async(text: string, replyTo: string, auth_token: string, ct0: string) => {
  const variables = {
    tweet_text: text,
    dark_request: false,
    media: {
      media_entities: [],
      possibly_sensitive: false
    },
    semantic_annotation_ids: [],
    reply: {
      in_reply_to_tweet_id: replyTo,
      exclude_reply_user_ids: []
    }
  };

  try {
    ct0 = generateCt0()
    const response = await fetch(POST_TWEET_BASE_URL, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "Content-Type": "application/json",
        "Cookie": `auth_token=${auth_token}; ct0=${ct0}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "X-Csrf-Token": ct0
      },
      body: JSON.stringify({
        variables,
        features: POST_TWEET_FEATURES,
        queryId: "UYy4T67XpYXgWKOafKXB_A"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error posting tweet:", error);
    throw error;
  }
}