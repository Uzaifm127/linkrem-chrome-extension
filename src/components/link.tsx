import { Trash2 } from "lucide-react";

const Link = () => {
  return (
    <div
      className="bg-white rounded-md p-3 flex justify-between cursor-pointer"
      onClick={() =>
        window.open("https://youtube.com/xyz", `_linkrem-${Date.now()}`)
      }
    >
      <div className="space-y-1">
        <h4 className="text-lg font-semibold">Link</h4>
        <p className="text-muted-foreground font-medium">
          https://youtube.com/xyz
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
