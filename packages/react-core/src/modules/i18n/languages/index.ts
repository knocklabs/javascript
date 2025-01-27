import de from "./de";
import en from "./en";

export interface Translations {
  readonly archiveRead: string;
  readonly emptyFeedTitle: string;
  readonly emptyFeedBody: string;
  readonly notifications: string;
  readonly poweredBy: string;
  readonly markAllAsRead: string;
  readonly archiveNotification: string;
  readonly all: string;
  readonly unread: string;
  readonly read: string;
  readonly unseen: string;
  readonly msTeamsChannelSetError: string;
  readonly msTeamsConnect: string;
  readonly msTeamsConnected: string;
  readonly msTeamsConnecting: string;
  readonly msTeamsConnectContainerDescription: string;
  readonly msTeamsDisconnect: string;
  readonly msTeamsDisconnecting: string;
  readonly msTeamsError: string;
  readonly msTeamsReconnect: string;
  readonly msTeamsTenantIdNotSet: string;
  readonly slackConnectChannel: string;
  readonly slackChannelId: string;
  readonly slackConnecting: string;
  readonly slackDisconnecting: string;
  readonly slackConnect: string;
  readonly slackConnected: string;
  readonly slackConnectContainerDescription: string;
  readonly slackSearchbarDisconnected: string;
  readonly slackSearchbarMultipleChannels: string;
  readonly slackSearchbarNoChannelsConnected: string;
  readonly slackSearchbarNoChannelsFound: string;
  readonly slackSearchbarChannelsError: string;
  readonly slackSearchChannels: string;
  readonly slackConnectionErrorOccurred: string;
  readonly slackConnectionErrorExists: string;
  readonly slackChannelAlreadyConnected: string;
  readonly slackError: string;
  readonly slackDisconnect: string;
  readonly slackChannelSetError: string;
  readonly slackAccessTokenNotSet: string;
  readonly slackReconnect: string;
}

export interface I18nContent {
  readonly translations: Partial<Translations>;
  readonly locale: string;
}

export const locales = { en, de };
