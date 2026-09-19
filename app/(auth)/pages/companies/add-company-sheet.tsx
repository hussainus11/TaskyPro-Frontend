import React, { useState } from "react";
import { Plus, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

interface Branch {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface Field {
  label: string;
  type: 'text' | 'textarea';
  value: string;
}

interface Section {
  title: string;
  fields: Field[];
}

interface AddCompanySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCompanySheet: React.FC<AddCompanySheetProps> = ({ isOpen, onClose, onSuccess }) => {
  const [sections, setSections] = useState<Section[]>([
    {
      title: "Company Information",
      fields: [
        { label: "Name", type: "text", value: "" },
        { label: "Email", type: "text", value: "" },
        { label: "Phone", type: "text", value: "" },
        { label: "Address", type: "textarea", value: "" },
        { label: "Website", type: "text", value: "" },
        { label: "Industry", type: "text", value: "" }
      ]
    }
  ]);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingLabel, setEditingLabel] = useState<{ sectionIndex: number; fieldIndex: number } | null>(null);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);

  const addSection = () => {
    setSections([...sections, { title: "New Section", fields: [] }]);
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...sections];
    newSections[index].title = title;
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addField = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields.push({ label: "New Field", type: "text", value: "" });
    setSections(newSections);
  };

  const updateField = (sectionIndex: number, fieldIndex: number, field: keyof Field, value: string) => {
    const newSections = [...sections];
    if (field === "type" && (value === "text" || value === "textarea")) {
      newSections[sectionIndex].fields[fieldIndex][field] = value as "text" | "textarea";
    } else if (field === "value") {
      newSections[sectionIndex].fields[fieldIndex][field] = value;
    }
    setSections(newSections);
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields.splice(fieldIndex, 1);
    setSections(newSections);
  };

  const addBranch = () => {
    setBranches([...branches, { name: "", address: "", phone: "", email: "" }]);
  };

  const updateBranch = (index: number, field: keyof Branch, value: string) => {
    const newBranches = [...branches];
    newBranches[index][field] = value;
    setBranches(newBranches);
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Collect company data from sections
      const companyData: any = {};
      sections.forEach(section => {
        section.fields.forEach(field => {
          const key = field.label.toLowerCase().replace(/\s+/g, '');
          companyData[key] = field.value;
        });
      });
      // Map to expected fields
      const payload = {
        name: companyData.name || "",
        email: companyData.email || "",
        phone: companyData.phone || "",
        address: companyData.address || "",
        website: companyData.website || "",
        industry: companyData.industry || "",
        branches
      };

      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        toast.success("Company added successfully");
        onSuccess();
        onClose();
        // Reset form
        setSections([
          {
            title: "Company Information",
            fields: [
              { label: "Name", type: "text", value: "" },
              { label: "Email", type: "text", value: "" },
              { label: "Phone", type: "text", value: "" },
              { label: "Address", type: "textarea", value: "" },
              { label: "Website", type: "text", value: "" },
              { label: "Industry", type: "text", value: "" }
            ]
          }
        ]);
        setBranches([]);
      } else {
        toast.error("Failed to add company");
      }
    } catch (error) {
      toast.error("Error adding company");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-screen max-width:90% overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-4 pt-0">
          <div className="flex justify-end mb-4">
            <Button type="button" variant="outline" onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" /> Add Section
            </Button>
          </div>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border rounded p-4">
              <div className="flex items-center justify-between mb-4">
                {editingTitle === sectionIndex ? (
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                    onBlur={() => setEditingTitle(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingTitle(null)}
                    autoFocus
                  />
                ) : (
                  <h3
                    className="text-lg font-semibold cursor-pointer"
                    onClick={() => setEditingTitle(sectionIndex)}
                  >
                    {section.title}
                  </h3>
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addField(sectionIndex)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Field
                  </Button>
                  {sections.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(sectionIndex)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex items-start gap-2">
                    <div className="flex-1">
                      {editingLabel?.sectionIndex === sectionIndex && editingLabel?.fieldIndex === fieldIndex ? (
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, "label", e.target.value)}
                          onBlur={() => setEditingLabel(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingLabel(null)}
                          autoFocus
                          className="mb-1"
                        />
                      ) : (
                        <label
                          className="block text-sm font-medium mb-1 cursor-pointer"
                          onClick={() => setEditingLabel({ sectionIndex, fieldIndex })}
                        >
                          {field.label}
                        </label>
                      )}
                      {field.type === "textarea" ? (
                        <Textarea
                          value={field.value}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, "type" in e.target ? "value" : "value", e.target.value)}
                          required={field.label === "Name" || field.label === "Email"}
                        />
                      ) : (
                        <Input
                          type={field.label === "Email" ? "email" : "text"}
                          value={field.value}
                          onChange={(e) => updateField(sectionIndex, fieldIndex, "value", e.target.value)}
                          required={field.label === "Name" || field.label === "Email"}
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(sectionIndex, fieldIndex)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Branches</h3>
              <Button type="button" variant="outline" size="sm" onClick={addBranch}>
                <Plus className="w-4 h-4 mr-2" /> Add Branch
              </Button>
            </div>
            {branches.map((branch, index) => (
              <div key={index} className="border rounded p-4 mb-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeBranch(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch Name</label>
                    <Input
                      value={branch.name}
                      onChange={(e) => updateBranch(index, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={branch.email}
                      onChange={(e) => updateBranch(index, "email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={branch.phone}
                      onChange={(e) => updateBranch(index, "phone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Textarea
                    value={branch.address}
                    onChange={(e) => updateBranch(index, "address", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Company"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanySheet;