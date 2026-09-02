import React from "react";

import { ExitAppModal } from "@/components/ExitAppModal";
import { useAndroidExitConfirmation } from "@/navigation/useAndroidExitConfirmation";

type Props = {
  children: React.ReactNode;
};

export function AndroidExitGuard({ children }: Props) {
  const { visible, dismiss, confirmExit } = useAndroidExitConfirmation();

  return (
    <>
      {children}
      <ExitAppModal
        visible={visible}
        onCancel={dismiss}
        onConfirm={confirmExit}
      />
    </>
  );
}
