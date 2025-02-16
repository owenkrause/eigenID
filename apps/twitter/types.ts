export type User = {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  description: string | null;
  followers_count: number;
  friends_count: number;
  created_at: string;
  ext_is_blue_verified: boolean;
  profile_image_url_https: string;
}

export type Tweet = {
  id: number;
  id_str: string;
  full_text: string;
  created_at: string;
  user_id: number;
  user_id_str: string;
  entities: {
    user_mentions: Array<{
      screen_name: string;
      name: string;
      id: number;
      id_str: string;
    }>;
    urls: Array<{
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
  };
}

export type Notification = {
  id: string;
  timestampMs: string;
  message: {
    text: string;
    entities: Array<{
      fromIndex: number;
      toIndex: number;
      ref: {
        user: {
          id: string;
        };
      };
    }>;
  };
  template: {
    aggregateUserActionsV1?: {
      targetObjects: Array<{
        tweet: {
          id: string;
        };
      }>;
      fromUsers: Array<{
        user: {
          id: string;
        };
      }>;
    };
  };
}

export type NotificationResponse = {
  globalObjects: {
    users: Record<string, User>;
    tweets: Record<string, Tweet>;
    notifications: Record<string, Notification>;
  };
  timeline: {
    instructions: Array<{
      addEntries?: {
        entries: Array<{
          content: {
            item?: {
              content: {
                tweet?: {
                  displayType: string;
                  id: string;
                };
                notification?: Notification;
              };
            };
          };
        }>;
      };
    }>;
  };
}

export type TweetResponse = {
  data: {
    threaded_conversation_with_injections_v2: {
      instructions: Array<{
        type: string;
        entries?: Array<{
          content: {
            itemContent?: {
              itemType: string;
              tweet_results: {
                result: {
                  rest_id: string;
                  legacy: {
                    in_reply_to_status_id_str: string;
                    full_text: string;
                  };
                };
              };
            };
            items?: Array<{
              item: {
                itemContent: {
                  tweet_results: {
                    result: {
                      legacy: {
                        full_text: string;
                      };
                    };
                  };
                };
              };
            }>;
          };
        }>;
      }>;
    };
  };
};