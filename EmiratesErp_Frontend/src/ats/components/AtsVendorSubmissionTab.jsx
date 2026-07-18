import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Plus } from 'lucide-react';

const AtsVendorSubmissionTab = ({
    submission = {},
    onChange
}) => {
    const [token1, setToken1] = useState('');
    const [token2, setToken2] = useState('');
    const [token3, setToken3] = useState('');
    const [editorInstance, setEditorInstance] = useState(null);

    const handleFieldChange = (name, value) => {
        onChange({
            ...submission,
            [name]: value
        });
    };

    const handleAddToken = () => {
        // Find which token is selected (prefer token1, then token2, then token3)
        const selectedToken = token1 || token2 || token3;
        if (!selectedToken) return;

        // Insert token into the editor
        if (editorInstance) {
            editorInstance.model.change(writer => {
                const insertPosition = editorInstance.model.document.selection.getFirstPosition();
                writer.insertText(`{${selectedToken}}`, insertPosition);
            });
        }

        // Reset selects
        setToken1('');
        setToken2('');
        setToken3('');
    };

    return (
        <div className="space-y-6 text-foreground font-sans">
            {/* Row 1: Token placeholders select bar */}
            <div>
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Vendor Submission Description</label>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={token1}
                        onChange={(e) => { setToken1(e.target.value); setToken2(''); setToken3(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Candidate Field</option>
                        <option value="Candidate Name">Candidate Name</option>
                        <option value="Candidate Email">Candidate Email</option>
                        <option value="Candidate Mobile">Candidate Mobile</option>
                        <option value="Technologies">Technologies</option>
                        <option value="Experience">Experience</option>
                    </select>

                    <select
                        value={token2}
                        onChange={(e) => { setToken2(e.target.value); setToken1(''); setToken3(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Job Field</option>
                        <option value="Job Title">Job Title</option>
                        <option value="Job Code">Job Code</option>
                        <option value="Job Rate">Job Rate</option>
                        <option value="Client Name">Client Name</option>
                    </select>

                    <select
                        value={token3}
                        onChange={(e) => { setToken3(e.target.value); setToken1(''); setToken2(''); }}
                        className="px-3 py-2 text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20 min-w-[150px] cursor-pointer"
                    >
                        <option value="">Select Vendor Field</option>
                        <option value="Vendor Name">Vendor Name</option>
                        <option value="Primary Recruiter">Primary Recruiter</option>
                        <option value="Submission Date">Submission Date</option>
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

            {/* Row 2: Mailing Subject */}
            <div>
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Mailing Subject</label>
                <input
                    type="text"
                    name="mailingSubject"
                    value={submission.mailingSubject || ''}
                    onChange={(e) => handleFieldChange('mailingSubject', e.target.value)}
                    className="px-3 py-2 w-full text-sm border border-border bg-background text-foreground rounded-theme outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Submission for {Job Title} - {Candidate Name}"
                />
            </div>

            {/* Row 3: Body Editor */}
            <div className="space-y-1.5 ck-editor-custom-wrapper">
                <label className="block text-xs font-bold text-foreground-muted mb-1.5 uppercase tracking-wider">Body</label>
                <div className="border border-border rounded-xl overflow-hidden shadow-sm hover:border-primary/40 transition-all">
                    <CKEditor
                        editor={ClassicEditor}
                        data={submission.body || ''}
                        onReady={editor => setEditorInstance(editor)}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            handleFieldChange('body', data);
                        }}
                        config={{
                            placeholder: 'Compose template body here...',
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
        </div>
    );
};

export default AtsVendorSubmissionTab;
