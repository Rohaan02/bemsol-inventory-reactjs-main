// FloatingSidebar.jsx
import { useState } from "react";
import Select from "react-select";
import { MessageCircle, Image, FileText, ChevronLeft, ChevronRight, Upload } from "lucide-react";

const FloatingSidebar = ({ isOpen, setIsOpen }) => {
  const [activePanel, setActivePanel] = useState("comments");
  const [comment, setComment] = useState("");

  const handleSend = () => {
    if (comment.trim()) {
      console.log("New comment:", comment);
      setComment("");
    }
  };

  return (
    <div className="fixed right-0">
      {/* Content Panel */}
      {isOpen && (
        <div className="w-80 bg-white border-l border-gray-300 shadow-lg p-3">
          {activePanel === "comments" && (
            <div className="flex flex-col gap-2 text-black">
              <h3 className="font-semibold">Comments</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border rounded p-2 text-sm"
                rows={4}
              />
              <button
                onClick={handleSend}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 self-end"
              >
                Send
              </button>
            </div>
          )}
          {activePanel === "images" && (
            <div className="flex flex-col gap-2 text-black">
              <h3 className="font-semibold">Attach Image</h3>
              <input type="file" accept="image/*" />
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 self-end">
                <Upload size={14} /> Upload
              </button>
            </div>
          )}
          {activePanel === "documents" && (
            <div className="flex flex-col gap-2 text-black">
              <h3 className="font-semibold">Attach Document</h3>
              <input type="file" accept=".pdf,.doc,.docx" />
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 self-end">
                <Upload size={14} /> Upload
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Buttons */}
      <div className="bg-white border-l border-gray-300 w-12 flex flex-col">
        <button
          className="absolute -left-6 top-4 bg-green-600 text-white p-1 rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="flex flex-col gap-2 p-2">
          <button
            onClick={() => setActivePanel("comments")}
            className={`flex items-center justify-center p-2 rounded text-sm ${
              activePanel === "comments"
                ? "bg-green-100 text-green-700"
                : "hover:bg-gray-100 text-black"
            }`}
            title="Comments"
          >
            <MessageCircle size={18} />
          </button>
          <button
            onClick={() => setActivePanel("images")}
            className={`flex items-center justify-center p-2 rounded text-sm ${
              activePanel === "images"
                ? "bg-green-100 text-green-700"
                : "hover:bg-gray-100 text-black"
            }`}
            title="Images"
          >
            <Image size={18} />
          </button>
          <button
            onClick={() => setActivePanel("documents")}
            className={`flex items-center justify-center p-2 rounded text-sm ${
              activePanel === "documents"
                ? "bg-green-100 text-green-700"
                : "hover:bg-gray-100 text-black"
            }`}
            title="Documents"
          >
            <FileText size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingSidebar;
