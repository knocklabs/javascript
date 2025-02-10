import React from "react";

import "./styles.css";

export interface AvatarProps {
  name: string;
  src?: string | null;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src }) => {
  function getInitials(name: string) {
    const [firstName, lastName] = name.split(" ");
    return firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : firstName
        ? firstName.charAt(0)
        : "";
  }

  return (
    <div className="rnf-avatar">
      {src ? (
        <img src={src} alt={name} className="rnf-avatar__image" />
      ) : (
        <span className="rnf-avatar__initials">{getInitials(name)}</span>
      )}
    </div>
  );
};
