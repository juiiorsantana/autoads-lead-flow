
export interface CampaignData {
  campaign_name: string;
  ad_set_name: string;
  ad_name: string;
  amount_spent: number;
  reach: number;
  impressions: number;
  cpm: number;
  conversations: number; // This will be mapped from messaging_onversations in the database
  link_clicks: number;
  landing_page_views: number;
  leads: number;
  day: string;
}
