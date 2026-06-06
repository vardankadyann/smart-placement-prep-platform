import { DocumentUpload } from "@/components/upload/document-upload";

export default function UploadPage() {
  return (
    <div>
      <div className="border-b border-border/50 px-6 py-4">
        <h1 className="text-2xl font-semibold">Upload Documents</h1>
        <p className="text-sm text-muted-foreground">
          Add PDF course materials to your knowledge base
        </p>
      </div>
      <DocumentUpload />
    </div>
  );
}
