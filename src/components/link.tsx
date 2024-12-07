import { Trash2 } from "lucide-react";
import { LinkProps } from "@/types/props";

const Link: React.FC<LinkProps> = ({ name, tags, url }) => {
  return (
    <div
      className="bg-white rounded-md p-3 flex justify-between cursor-pointer"
      onClick={() => window.open(url, `_linkrem-${Date.now()}`)}
    >
      <div className="space-y-1">
        <div className="flex gap-6">
          <h4 className="text-lg font-semibold whitespace-nowrap text-ellipsis">
            {name}
          </h4>

          <div className="flex flex-nowrap overflow-hidden">
            {tags.map((tag) => (
              <div key={tag.id} className="bg-primary rounded-sm text-white">
                {tag.tagName}
              </div>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground font-medium whitespace-nowrap text-ellipsis">
          {url}
        </p>
      </div>
      <Trash2
        className="h-7 w-7 rounded-sm transition text-red-600 cursor-pointer hover:bg-red-200 p-1"
        onClick={(e) => {
          e.preventDefault();
          //   if (!!dontShowDeletePopup) {
          //     deleteMutation.mutate(name);
          //   } else {
          //     setDeleteDialogOpen(true);
          //   }
        }}
      />
    </div>
  );
};

export default Link;
