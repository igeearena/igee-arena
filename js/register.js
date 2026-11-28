"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const supabase = window.igeeSupabase;

  if (!supabase) {
    alert("Supabase is not initialized. Please refresh the page.");
    return;
  }

  const form = document.getElementById("registrationForm");
  const fullNameInput = document.getElementById("fullName");
  const gameNameInput = document.getElementById("gameName");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const pictureInput = document.getElementById("profilePicture");

  if (!form) {
    console.error("Registration form was not found.");
    return;
  }

  let pendingUser = null;
  let pendingPicture = null;

  const message = document.createElement("p");
  message.id = "registrationMessage";
  message.setAttribute("role", "status");
  message.style.cssText =
    "margin:15px 0;padding:12px;border-radius:8px;display:none;font-size:14px;";
  form.appendChild(message);

  const otpSection = document.createElement("div");
  otpSection.id = "emailOtpSection";
  otpSection.style.cssText =
    "display:none;margin-top:20px;padding:18px;border:1px solid #8b5cf6;border-radius:12px;";

  otpSection.innerHTML = `
    <h3 style="color:#fff;margin-bottom:10px;">Verify your email</h3>
    <p style="color:#bbb;margin-bottom:14px;">
      Enter the six-digit code sent to your email address.
    </p>
    <input
      id="emailOtp"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="6"
      placeholder="Enter 6-digit code"
      style="width:100%;padding:14px;border-radius:8px;margin-bottom:12px;"
    >
    <button
      type="button"
      id="verifyEmailOtp"
      style="width:100%;padding:14px;border:0;border-radius:8px;background:#8b5cf6;color:white;font-weight:bold;"
    >
      VERIFY EMAIL
    </button>
    <button
      type="button"
      id="resendEmailOtp"
      style="width:100%;padding:12px;margin-top:10px;background:transparent;color:#aaa;border:1px solid #555;border-radius:8px;"
    >
      RESEND CODE
    </button>
  `;

  form.appendChild(otpSection);

  function showMessage(text, type = "error") {
    message.textContent = text;
    message.style.display = "block";
    message.style.color = type === "success" ? "#4ade80" : "#f87171";
    message.style.background =
      type === "success"
        ? "rgba(74,222,128,0.10)"
        : "rgba(248,113,113,0.10)";
  }

  function setButtonLoading(button, loading, normalText) {
    button.disabled = loading;
    button.textContent = loading ? "PLEASE WAIT..." : normalText;
    button.style.opacity = loading ? "0.6" : "1";
  }

  function getPhoneNumber() {
    const digits = phoneInput.value.replace(/\D/g, "");

    if (!/^\d{10}$/.test(digits)) {
      throw new Error("Enter a valid Nigerian phone number with 10 digits.");
    }

    return "+234" + digits;
  }

  if (pictureInput) {
    pictureInput.addEventListener("change", () => {
      pendingPicture =
        pictureInput.files && pictureInput.files.length
          ? pictureInput.files[0]
          : null;
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (pendingUser) {
      showMessage("Please verify the code sent to your email.");
      return;
    }

    const submitButton = form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    const originalButtonText = submitButton
      ? submitButton.textContent
      : "REGISTER";

    try {
      const fullName = fullNameInput.value.trim();
      const gameName = gameNameInput.value.trim();
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const phone = getPhoneNumber();

      if (!fullName || !gameName || !email) {
        throw new Error("Please complete all required fields.");
      }

      if (password.length < 8) {
        throw new Error("Your password must contain at least 8 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Your passwords do not match.");
      }

      if (
        pendingPicture &&
        !["image/jpeg", "image/png", "image/webp"].includes(
          pendingPicture.type
        )
      ) {
        throw new Error("Profile picture must be JPG, PNG or WEBP.");
      }

      if (pendingPicture && pendingPicture.size > 5 * 1024 * 1024) {
        throw new Error("Profile picture must not exceed 5MB.");
      }

      if (submitButton) {
        setButtonLoading(submitButton, true, originalButtonText);
      }

      showMessage("Creating your IGEE ARENA account...", "success");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            nickname: gameName,
            phone: phone
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("Account creation could not be completed.");
      }

      pendingUser = {
        id: data.user.id,
        email: email
      };

      otpSection.style.display = "block";
      showMessage(
        "Registration started! Check your email for the six-digit verification code.",
        "success"
      );

      if (submitButton) {
        submitButton.disabled = true;
      }

      otpSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    } catch (error) {
      showMessage(error.message || "Registration failed. Please try again.");
      if (submitButton) {
        setButtonLoading(submitButton, false, originalButtonText);
      }
    }
  });

  document.getElementById("verifyEmailOtp").addEventListener(
    "click",
    async () => {
      const button = document.getElementById("verifyEmailOtp");
      const originalText = "VERIFY EMAIL";

      try {
        if (!pendingUser) {
          throw new Error("Please register before verifying your email.");
        }

        const token = document.getElementById("emailOtp").value.trim();

        if (!/^\d{6}$/.test(token)) {
          throw new Error("Enter the complete six-digit verification code.");
        }

        setButtonLoading(button, true, originalText);
        showMessage("Verifying your email...", "success");

        const { data, error } = await supabase.auth.verifyOtp({
          email: pendingUser.email,
          token: token,
          type: "signup"
        });

        if (error) throw error;

        if (!data.user || !data.session) {
          throw new Error(
            "Email verification succeeded, but your login session was not created. Please sign in."
          );
        }

        const user = data.user;

        if (pendingPicture) {
          showMessage("Email verified. Uploading your profile picture...", "success");

          const safeName = pendingPicture.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

          const filePath =
            user.id + "/" + Date.now() + "-" + safeName;

          const { error: uploadError } = await supabase.storage
            .from("profile-photos")
            .upload(filePath, pendingPicture, {
              cacheControl: "3600",
              upsert: false,
              contentType: pendingPicture.type
            });

          if (uploadError) throw uploadError;

          const { error: profileError } = await supabase
            .from("profiles")
            .update({ avatar_path: filePath })
            .eq("id", user.id);

          if (profileError) {
            throw new Error(
              "Your account is verified, but your profile picture could not be saved: " +
              profileError.message
            );
          }
        }

        showMessage(
          "Congratulations! Your IGEE ARENA account has been verified successfully.",
          "success"
        );

        otpSection.style.display = "none";
        form.reset();

        pendingUser = null;
        pendingPicture = null;

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2500);

      } catch (error) {
        showMessage(error.message || "Verification failed. Please try again.");
      } finally {
        setButtonLoading(button, false, originalText);
      }
    }
  );

  document.getElementById("resendEmailOtp").addEventListener(
    "click",
    async () => {
      const button = document.getElementById("resendEmailOtp");

      try {
        if (!pendingUser) {
          throw new Error("Please register first.");
        }

        setButtonLoading(button, true, "RESEND CODE");

        const { error } = await supabase.auth.resend({
          type: "signup",
          email: pendingUser.email
        });

        if (error) throw error;

        showMessage("A new verification code has been requested.", "success");

      } catch (error) {
        showMessage(error.message || "Could not resend the code.");
      } finally {
        setButtonLoading(button, false, "RESEND CODE");
      }
    }
  );
});
