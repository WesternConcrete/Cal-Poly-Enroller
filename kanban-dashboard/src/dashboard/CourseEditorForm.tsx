import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";

import { ConfirmationButtons } from "../components/buttons";

export interface Props {
  title?: string;
  description?: string;
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
}

export default function CourseEditorForm({
  onSubmit,
  onCancel,
  title: initialTitle = "",
  description: initialDesc = "",
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDesc] = useState(initialDesc);

  const handleSubmit = () => {
    if (title && description) {
      onSubmit(title, description);
      setTitle("");
    }
  };

  const handleCancel = () => {
    onCancel();
    setTitle("");
  };

  return (
    <div>
      <TextField
        autoFocus
        fullWidth
        placeholder="Course ID"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        multiline
        fullWidth
        rows={3}
        placeholder="Class Name"
        value={description}
        onChange={(e) => setDesc(e.target.value)}
      />

      <ConfirmationButtons onConfirm={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
