'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Camera, Mail, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/lib/settings';
import { useAuth } from '@/contexts/AuthContext';

export function ProfileSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    location: '',
    website: '',
    bio: ''
  });
  
  const { user } = useAuth();
  const { getUserProfile, updateUserProfile } = useSettings();

  // Load user profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await getUserProfile();
        if (profile) {
          setFormData({
            fullName: profile.full_name || '',
            username: profile.username || '',
            email: user.email || '',
            location: profile.location || '',
            website: profile.website || '',
            bio: profile.bio || ''
          });
        }
      }
    };
    
    loadProfile();
  }, [user, getUserProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const success = await updateUserProfile({
        full_name: formData.fullName,
        username: formData.username,
        location: formData.location,
        website: formData.website,
        bio: formData.bio
      });
      
      if (success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    // Simulate file upload
    toast.success('Avatar uploaded successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
        <p className="text-gray-400">Manage your personal information and public profile</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Picture */}
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-400" />
              Profile Picture
            </CardTitle>
            <CardDescription>Upload a photo to personalize your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/api/placeholder/96/96" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              
              <Button 
                onClick={handleAvatarUpload}
                variant="outline" 
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                JPG, PNG or GIF. Max size 2MB. Recommended: 400x400px
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="bg-[#1E1E1E] border-neutral-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-purple-400" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-neutral-800/50 border-neutral-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="bg-neutral-800/50 border-neutral-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                className="bg-neutral-800/30 border-neutral-700 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="bg-neutral-800/50 border-neutral-700 text-white"
                  placeholder="City, Country"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website" className="text-white">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="bg-neutral-800/50 border-neutral-700 text-white"
                  placeholder="your-website.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full min-h-20 px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
                maxLength={160}
              />
              <p className="text-xs text-gray-500">{formData.bio.length}/160 characters</p>
            </div>

            <Button 
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Account Statistics</CardTitle>
          <CardDescription>Your account activity overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Posts Created', value: '42', icon: <User className="h-4 w-4" />, color: 'text-blue-400' },
              { label: 'Total Views', value: '2.5K', icon: <Mail className="h-4 w-4" />, color: 'text-green-400' },
              { label: 'Style Boards', value: '15', icon: <Calendar className="h-4 w-4" />, color: 'text-purple-400' },
              { label: 'Completion Rate', value: '89%', icon: <LinkIcon className="h-4 w-4" />, color: 'text-orange-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-4 bg-neutral-800/30 rounded-lg border border-neutral-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
                  {stat.icon}
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
          <CardDescription>Your account details and membership info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Email Address</p>
                  <p className="text-sm text-gray-400">{formData.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-neutral-700 text-gray-300">
                Verify
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Member Since</p>
                  <p className="text-sm text-gray-400">January 2024</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Account Type</p>
                  <p className="text-sm text-gray-400">Creator Pro</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
