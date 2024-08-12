import { CommandBarButton, DefaultButton, IconButton, IButtonProps } from '@fluentui/react';
import styles from './Button.module.css';

interface ButtonProps extends IButtonProps {
  onClick: () => void;
  text?: string; // Make text optional
}

export const UploadButton: React.FC<ButtonProps> = ({ onClick, text, ...props }) => {
  return (
    <IconButton
      className={styles.uploadButtonRoot}
      iconProps={{ iconName: 'CloudUpload' }} // Updated icon name
      title={text || "Upload"}
      ariaLabel={text || "Upload"}
      onClick={onClick}
      {...props}
    >
      {text || "Upload"} {/* Visible title */}
    </IconButton>
  );
}

export const ShareButton: React.FC<ButtonProps> = ({ onClick, text, ...props }) => {
  return (
    <CommandBarButton
      className={styles.shareButtonRoot}
      iconProps={{ iconName: 'Share' }}
      onClick={onClick}
      text={text}
    />
  )
}

export const HistoryButton: React.FC<ButtonProps> = ({ onClick, text, ...props }) => {
  return (
    <DefaultButton
      className={styles.historyButtonRoot}
      text={text}
      iconProps={{ iconName: 'History' }}
      onClick={onClick}
    />
  )
}
