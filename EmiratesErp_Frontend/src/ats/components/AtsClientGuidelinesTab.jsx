import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Plus, X, Upload } from 'lucide-react';

const AtsClientGuidelinesTab = ({
    guidelines = {},
    onChange,
    guidelineDocuments = [],
    onGuidelineDocumentsChange
}) => {
    const [token1, setToken1] = useState('');
    const [token2, setToken2] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    const handleFieldChange = (name, value) => {
        onChange({
            ...guidelines,
            [name]: value
        });
    };

    const handleAddToken = () => {
        const selectedToken = token1 || token2;
        if (!selectedToken) return;

        if (editorInstance) {
            editorInstance.model.change(writer => {
                const insertPosition = editorInstance.model.document.selection.getFirstPosition();
                writer.insertText(`{${selectedToken}}`, insertPosition);
            });
        }

        setToken1('');
        setToken2('');
    };

    const handleAddDocument = () => {
        const newDoc = {
            id: null,
            isNew: true,
            documentTitle: '',
            documentSource: 'CLIENT_GUIDELINE',
            description: '',
            fileName: '',
            filePath: '',
            rawFile: null
        };
        onGuidelineDocumentsChange([...guidelineDocuments, newDoc]);
    };

    const handleRemoveDocument = (index) => {
        const updated = [...guidelineDocuments];
        updated.splice(index, 1);
        onGuidelineDocumentsChange(updated);
    };

    const handleDocFieldChange = (index, field, value) => {
        const updated = [...guidelineDocuments];
        updated[index] = { ...updated[index], [field]: value };
        onGuidelineDocumentsChange(updated);
    };

    const handleFileChange = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const updated = [...guidelineDocuments];
        updated[index] = {
            ...updated[index],
            rawFile: file,
            fileName: file.name,
            documentTitle: updated[index].documentTitle || file.name.split('.')[0]
        };
        onGuidelineDocumentsChange(updated);
    };

    return (
        <div className="space-y-6 text-foreground font-sans">
            <div>
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Client Submission Guidelines placeholders</label>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={token1}
                        onChange={(e) => { setToken1(e.target.value); setToken2(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Candidate Field</option>
                        <option value="Candidate Name">Candidate Name</option>
                        <option value="Candidate Email">Candidate Email</option>
                        <option value="Candidate Mobile">Candidate Mobile</option>
                    </select>

                    <select
                        value={token2}
                        onChange={(e) => { setToken2(e.target.value); setToken1(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Job Field</option>
                        <option value="Job Title">Job Title</option>
                        <option value="Job Code">Job Code</option>
                        <option value="Client Name">Client Name</option>
                    </select>

                    <button
                        type="button"
                        onClick={handleAddToken}
                        className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-theme hover:bg-primary/90 transition-colors shadow shadow-primary/10"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </div>

            <div className="space-y-1.5 ck-editor-custom-wrapper">
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Guidelines & Terms</label>
                <div className="border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary/40 transition-all">
                    <CKEditor
                        editor={ClassicEditor}
                        data={guidelines.submissionGuidelines || ''}
                        onReady={editor => setEditorInstance(editor)}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleFieldChange('submissionGuidelines', data);
                        }}
                        config={{
                            placeholder: 'Compose client guidelines here...',
                            toolbar: [
                                'heading', '|',
                                'bold', 'italic', 'underline', 'strikethrough', '|',
                                'bulletedList', 'numberedList', 'blockQuote', '|',
                                'insertTable', 'link', '|',
                                'undo', 'redo'
                            ]
                        }}
                    />
                </div>
            </div>

            {/* Guideline Documents Section */}
            <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wider">Guideline Documents</label>
                    <button
                        type="button"
                        onClick={handleAddDocument}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-theme shadow hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Guideline Doc</span>
                    </button>
                </div>

                {guidelineDocuments.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-theme text-foreground-muted italic text-xs">
                        No guideline documents uploaded yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guidelineDocuments.map((doc, idx) => (
                            <div key={idx} className="border border-border rounded-theme p-4 bg-background-muted/20 relative space-y-3">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDocument(idx)}
                                    className="absolute top-2 right-2 text-destructive hover:text-destructive/80 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground-muted uppercase mb-1">Document Title *</label>
                                        <input
                                            type="text"
                                            required
                                            value={doc.documentTitle || ''}
                                            onChange={(e) => handleDocFieldChange(idx, 'documentTitle', e.target.value)}
                                            placeholder="e.g. Compliance Checklist"
                                            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground-muted uppercase mb-1">Select File *</label>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-theme text-[10px] font-bold cursor-pointer transition-colors shadow">
                                                <Upload className="h-3 w-3" />
                                                <span>Choose File</span>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileChange(idx, e)}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(doc.fileName || doc.filePath) && (
                                                <span className="text-xs text-foreground font-medium truncate max-w-[150px]" title={doc.fileName || doc.filePath}>
                                                    {doc.fileName || doc.filePath.split('/').pop()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground-muted uppercase mb-1">Description</label>
                                        <textarea
                                            rows={2}
                                            value={doc.description || ''}
                                            onChange={(e) => handleDocFieldChange(idx, 'description', e.target.value)}
                                            placeholder="Brief description of the guideline document"
                                            className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-theme outline-none text-foreground resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtsClientGuidelinesTab;
