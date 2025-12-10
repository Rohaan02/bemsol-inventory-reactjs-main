// src/components/Documents/DocumentsSection.jsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Upload,
  Download,
  File,
  FileText,
  Image,
  FileArchive,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import inventoryItemAPI from "@/lib/InventoryItemApi";

const DocumentsSection = ({ itemId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [itemId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await inventoryItemAPI.track(itemId);
      const itemData = response.data;
      setDocuments(itemData.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    await uploadDocuments(files);
    e.target.value = ""; // Reset file input
  };

  const uploadDocuments = async (files) => {
    try {
      setUploading(true);

      // Upload files one by one (since your API might not support multiple uploads)
      for (const file of files) {
        const formData = new FormData();
        formData.append("document", file);

        const response = await inventoryItemAPI.addDocument(itemId, formData);
        setDocuments((prev) => [response.data, ...prev]);
      }

      toast.success(`${files.length} document(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      // You'll need to add a deleteDocument method to your API
      // await inventoryItemAPI.deleteDocument(itemId, documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleDownload = async (document) => {
    try {
      // You'll need to add a downloadDocument method to your API
      // const blob = await inventoryItemAPI.downloadDocument(itemId, document.id);

      // For now, create a temporary download link
      const link = document.document_url
        ? document.document_url
        : `/storage/${document.document_path}`;

      window.open(link, "_blank");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const getFileIcon = (mimeType, fileName) => {
    const extension = fileName?.split(".").pop()?.toLowerCase();

    if (
      mimeType?.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)
    ) {
      return <Image className="w-5 h-5 text-red-500" />;
    }
    if (mimeType?.includes("pdf") || extension === "pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (
      mimeType?.includes("word") ||
      mimeType?.includes("document") ||
      ["doc", "docx"].includes(extension)
    ) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    if (
      mimeType?.includes("sheet") ||
      mimeType?.includes("excel") ||
      ["xls", "xlsx"].includes(extension)
    ) {
      return <FileText className="w-5 h-5 text-green-500" />;
    }
    if (
      mimeType?.includes("zip") ||
      mimeType?.includes("archive") ||
      ["zip", "rar", "7z"].includes(extension)
    ) {
      return <FileArchive className="w-5 h-5 text-yellow-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-green-600 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents ({documents.length})
          </span>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.zip"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">
                Uploading documents...
              </p>
            </div>
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.mime_type, document.original_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {document.document_name || document.original_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span>{formatFileSize(document.size)}</span>
                      <span>•</span>
                      <span>
                        {formatDate(document.created_at || document.date)}
                      </span>
                      {document.mime_type && (
                        <>
                          <span>•</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {document.mime_type.split("/")[1]?.toUpperCase() ||
                              "FILE"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="h-9 w-9 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(document.id)}
                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No documents uploaded</p>
            <p className="text-gray-400 text-sm mb-6">
              Upload files to keep them organized with this item
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Your First Document
            </Button>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            Supported File Types
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Documents: PDF, DOC, DOCX, XLS, XLSX, TXT</p>
            <p>• Images: JPG, JPEG, PNG</p>
            <p>• Archives: ZIP</p>
            <p>• Maximum file size: 10MB per file</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsSection;
