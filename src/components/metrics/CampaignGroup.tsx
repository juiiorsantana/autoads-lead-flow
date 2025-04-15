
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { CampaignData } from "@/types/metrics";

interface CampaignGroupProps {
  campaign: string;
  items: CampaignData[];
}

export function CampaignGroup({ campaign, items }: CampaignGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Ensure these values are not undefined by using default values of 0
  const totalSpent = items.reduce((sum, item) => sum + (item.amount_spent || 0), 0);
  const totalReach = items.reduce((sum, item) => sum + (item.reach || 0), 0);
  const totalImpressions = items.reduce((sum, item) => sum + (item.impressions || 0), 0);
  const totalConversations = items.reduce((sum, item) => sum + (item.messaging_conversations || 0), 0);
  const totalClicks = items.reduce((sum, item) => sum + (item.link_clicks || 0), 0);
  const totalViews = items.reduce((sum, item) => sum + (item.landing_page_views || 0), 0);
  const totalLeads = items.reduce((sum, item) => sum + (item.leads || 0), 0);

  return (
    <>
      <tr 
        className="border-b hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
              {isExpanded ? (
                <ArrowUpDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </Button>
            <span className="font-medium">{campaign}</span>
          </div>
        </td>
        <td className="p-3">-</td>
        <td className="p-3">-</td>
        <td className="p-3 text-right">R$ {totalSpent.toFixed(2)}</td>
        <td className="p-3 text-right">{totalReach.toLocaleString()}</td>
        <td className="p-3 text-right">{totalImpressions.toLocaleString()}</td>
        <td className="p-3 text-right">{totalConversations.toLocaleString()}</td>
        <td className="p-3 text-right">{totalClicks.toLocaleString()}</td>
        <td className="p-3 text-right">{totalViews.toLocaleString()}</td>
        <td className="p-3 text-right">{totalLeads.toLocaleString()}</td>
        <td className="p-3 text-right">-</td>
      </tr>
      
      {isExpanded && items.map((item, index) => (
        <tr key={index} className="bg-gray-50 border-b">
          <td className="p-3 pl-10">{campaign}</td>
          <td className="p-3">{item.ad_set_name}</td>
          <td className="p-3">{item.ad_name}</td>
          <td className="p-3 text-right">R$ {(item.amount_spent || 0).toFixed(2)}</td>
          <td className="p-3 text-right">{(item.reach || 0).toLocaleString()}</td>
          <td className="p-3 text-right">{(item.impressions || 0).toLocaleString()}</td>
          <td className="p-3 text-right">{(item.messaging_conversations || 0).toLocaleString()}</td>
          <td className="p-3 text-right">{(item.link_clicks || 0).toLocaleString()}</td>
          <td className="p-3 text-right">{(item.landing_page_views || 0).toLocaleString()}</td>
          <td className="p-3 text-right">{(item.leads || 0).toLocaleString()}</td>
          <td className="p-3 text-right">{item.day}</td>
        </tr>
      ))}
    </>
  );
}
