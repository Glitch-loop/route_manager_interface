import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";

interface ConfirmDeleteDialogProps {
    open: boolean;
    title: string;
    question: string;
    leftText: string;
    rightText: string;
    
    onLeftClick: () => void;
    onRightClick: () => void;
    onClose: () => void;

}

export default function ConfirmDialog({ open, title, question, leftText, rightText,  onLeftClick, onRightClick, onClose }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <p>{question}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLeftClick} color="primary">{leftText}</Button>
        <Button onClick={onRightClick} color="error">{rightText}</Button>
      </DialogActions>
    </Dialog>
  );
}
