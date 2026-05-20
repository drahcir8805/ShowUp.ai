"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Auth } from "@/components/Auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { authenticatedFetch } from "@/lib/api-client";

type User = { id: string; email?: string };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [lookupUsername, setLookupUsername] = useState("");
  const [lookupProfile, setLookupProfile] = useState<{
    user_id: string;
    username: string;
    display_name: string;
    bio?: string;
  } | null>(null);

  const [following, setFollowing] = useState<
    Array<{ following_id: string; user_profiles?: { username: string; display_name: string } }>
  >([]);
  const [followers, setFollowers] = useState<Array<{ user_profiles?: { username: string; display_name: string } }>>([]);
  const [trustedFriends, setTrustedFriends] = useState<
    Array<{ id: string; friend_user_id: string; email: string; alerts_enabled: boolean; user_profiles?: { username: string; display_name: string } }>
  >([]);

  const loadProfile = useCallback(async () => {
    const response = await authenticatedFetch("/api/profile");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to load profile.");

    if (data.profile) {
      setUsername(data.profile.username || "");
      setDisplayName(data.profile.display_name || "");
      setBio(data.profile.bio || "");
      setAvatarUrl(data.profile.avatar_url || "");
    }
  }, []);

  const loadSocial = useCallback(async () => {
    const [followingRes, followersRes, trustedRes] = await Promise.all([
      authenticatedFetch("/api/following"),
      authenticatedFetch("/api/followers"),
      authenticatedFetch("/api/trusted-friends"),
    ]);

    const [followingData, followersData, trustedData] = await Promise.all([
      followingRes.json(),
      followersRes.json(),
      trustedRes.json(),
    ]);

    if (followingRes.ok) setFollowing(followingData.following || []);
    if (followersRes.ok) setFollowers(followersData.followers || []);
    if (trustedRes.ok) setTrustedFriends(trustedData.trustedFriends || []);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser) {
        await Promise.all([loadProfile(), loadSocial()]);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication error.");
      setAuthChecked(true);
    }
  }, [loadProfile, loadSocial]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  const isFollowingLookup = useMemo(
    () => !!lookupProfile && following.some((item) => item.following_id === lookupProfile.user_id),
    [following, lookupProfile],
  );

  const saveProfile = async () => {
    setError("");
    setSuccess("");
    const response = await authenticatedFetch("/api/profile", {
      method: "POST",
      body: JSON.stringify({ username, displayName, bio, avatarUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to save profile.");
      return;
    }
    setSuccess("Profile saved.");
  };

  const lookupUser = async () => {
    setError("");
    setSuccess("");
    const trimmed = lookupUsername.trim().toLowerCase();
    if (!trimmed) return;

    const response = await authenticatedFetch(`/api/profile/${trimmed}`, { method: "GET" });
    const data = await response.json();
    if (!response.ok) {
      setLookupProfile(null);
      setError(data.error || "User not found.");
      return;
    }
    setLookupProfile(data.profile);
  };

  const followUser = async () => {
    if (!lookupProfile) return;
    const response = await authenticatedFetch(`/api/follow/${lookupProfile.user_id}`, { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to follow user.");
      return;
    }
    setSuccess(`You now follow @${lookupProfile.username}.`);
    await loadSocial();
  };

  const unfollowUser = async () => {
    if (!lookupProfile) return;
    const response = await authenticatedFetch(`/api/follow/${lookupProfile.user_id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to unfollow user.");
      return;
    }
    setSuccess(`You unfollowed @${lookupProfile.username}.`);
    await loadSocial();
  };

  const addTrustedFriend = async (friendUserId: string, fallbackEmail: string) => {
    const email = window.prompt("Friend email for alerts:", fallbackEmail || "");
    if (!email) return;

    const response = await authenticatedFetch("/api/trusted-friends", {
      method: "POST",
      body: JSON.stringify({
        friendUserId,
        email,
        alertsEnabled: true,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to add trusted friend.");
      return;
    }
    setSuccess("Trusted friend added.");
    await loadSocial();
  };

  const toggleAlert = async (trustedFriendId: string, enabled: boolean) => {
    const response = await authenticatedFetch(`/api/trusted-friends/${trustedFriendId}`, {
      method: "PATCH",
      body: JSON.stringify({ alertsEnabled: enabled }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to update alert setting.");
      return;
    }
    await loadSocial();
  };

  if (!authChecked) {
    return <div className="min-h-screen bg-[#f5f5dc] p-8">Loading...</div>;
  }
  if (!user) {
    return <Auth onAuth={checkAuth} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      <SiteHeader minimal backHref="/betting" />
      <main className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#4a4a4a]">Profile & Friends</h1>
          <Link href="/check-in" className="text-sm text-[var(--accent)] underline">
            Go to check-in screen
          </Link>
        </div>

        {error ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-xl font-semibold">Your profile</h2>
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your-handle" />
            </div>
            <div>
              <Label>Display name</Label>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your Name" />
            </div>
            <div>
              <Label>Bio (optional)</Label>
              <Input value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Short bio" />
            </div>
            <div>
              <Label>Avatar URL (optional)</Label>
              <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." />
            </div>
            <Button onClick={saveProfile}>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="text-xl font-semibold">Find and follow</h2>
            <div className="flex gap-2">
              <Input value={lookupUsername} onChange={(event) => setLookupUsername(event.target.value)} placeholder="username" />
              <Button onClick={lookupUser}>Find</Button>
            </div>
            {lookupProfile ? (
              <div className="rounded border p-3">
                <div className="font-semibold">
                  {lookupProfile.display_name} (@{lookupProfile.username})
                </div>
                <div className="text-sm text-gray-600">{lookupProfile.bio || "No bio yet."}</div>
                <div className="mt-3 flex gap-2">
                  {isFollowingLookup ? (
                    <Button variant="outline" onClick={unfollowUser}>
                      Unfollow
                    </Button>
                  ) : (
                    <Button onClick={followUser}>Follow</Button>
                  )}
                  {isFollowingLookup ? (
                    <Button
                      variant="outline"
                      onClick={() => addTrustedFriend(lookupProfile.user_id, user.email || "")}
                    >
                      Mark as trusted friend
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Following</h3>
              <div className="space-y-2 text-sm">
                {following.length === 0 ? <p className="text-gray-500">No users followed yet.</p> : null}
                {following.map((item) => (
                  <div key={item.following_id}>
                    @{item.user_profiles?.username || "unknown"} - {item.user_profiles?.display_name || "Unknown"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Followers</h3>
              <div className="space-y-2 text-sm">
                {followers.length === 0 ? <p className="text-gray-500">No followers yet.</p> : null}
                {followers.map((item, index) => (
                  <div key={`${item.user_profiles?.username || "follower"}-${index}`}>
                    @{item.user_profiles?.username || "unknown"} - {item.user_profiles?.display_name || "Unknown"}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">Trusted friends</h3>
              <div className="space-y-3 text-sm">
                {trustedFriends.length === 0 ? <p className="text-gray-500">No trusted friends yet.</p> : null}
                {trustedFriends.map((item) => (
                  <div key={item.id} className="rounded border p-2">
                    <p>
                      @{item.user_profiles?.username || "unknown"} ({item.email})
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => toggleAlert(item.id, !item.alerts_enabled)}
                    >
                      Alerts: {item.alerts_enabled ? "On" : "Off"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
