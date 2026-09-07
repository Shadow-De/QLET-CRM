"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateAgentProfile } from "@/app/actions/agent";
import { useSession } from "next-auth/react";
import Image from "next/image";

type ProfileSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  currentPosition: string;
  currentAvatar: string | null;
};

export function ProfileSettingsModal({
  isOpen,
  onClose,
  currentName,
  currentEmail,
  currentPosition,
  currentAvatar,
}: ProfileSettingsModalProps) {
  const { update } = useSession();
  
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [position, setPosition] = useState(currentPosition);
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("position", position);
    
    // Only send avatar if it's a base64 string (i.e. a newly uploaded file)
    // If it's the URL from the DB, we don't need to send it again.
    if (avatar && avatar.startsWith("data:")) {
      formData.append("avatarUrl", avatar);
    }

    const result = await updateAgentProfile(formData);

    if (result.success) {
      // Update local NextAuth session with a tiny URL cache-buster instead of the massive base64 string
      const newImage = (avatar && avatar.startsWith("data:")) 
        ? `/api/agent/avatar?t=${Date.now()}` 
        : avatar;
        
      await update({ name, email, position, image: newImage });
      onClose();
    } else {
      setError(result.error || "An error occurred");
    }
    
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h2 className="text-xl font-bold text-on-surface">Edit Profile</h2>
              <p className="text-sm text-outline mt-1">Update your personal information</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-surface">
              {error && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full border-2 border-outline-variant/30 overflow-hidden bg-surface-container flex items-center justify-center">
                  {avatar ? (
                    <Image src={avatar} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-outline">person</span>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-primary hover:text-primary-container transition-colors"
                >
                  Change Picture
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all"
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface">Position / Title</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Senior Lettings Agent"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-on-surface font-semibold hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-[#E6399B] to-[#7C3AED] text-white font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
