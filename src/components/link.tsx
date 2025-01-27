import { ExternalLink } from "lucide-react";
import { LinkProps } from "@/types/props";

const Link: React.FC<LinkProps> = ({ name, url }) => {
  return (
    <div
      className="bg-white rounded-md p-3 flex justify-between cursor-pointer"
      onClick={() => window.open(url, `_linkrem-${Date.now()}`)}
    >
      <div>
        <div className="flex gap-6">
          <h4 className="text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden w-[18rem]">
            {name}
          </h4>
        </div>
        <p className="text-muted-foreground font-medium whitespace-nowrap text-ellipsis overflow-hidden w-[19rem]">
          {url}
        </p>
      </div>
      <ExternalLink className="h-7 w-7 rounded-md transition text-slate-700 cursor-pointer hover:bg-primary/10 p-1" />
    </div>
  );
};

export default Link;
