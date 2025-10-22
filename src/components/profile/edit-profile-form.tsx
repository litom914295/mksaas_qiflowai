'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Calendar,
  Mail,
  MapPin,
  Phone,
  Save,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';

type ProfileFormData = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: 'male' | 'female' | 'other' | '';
  location: string;
  bio: string;
  avatar: string;
};

export default function EditProfileForm() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '138****8888',
    birthday: '1990-01-01',
    gender: 'male',
    location: '北京市',
    bio: '热爱国学文化，对命理学有浓厚兴趣',
    avatar: '/avatars/default.png',
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>(formData);

  function handleInputChange(field: keyof ProfileFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOriginalData(formData);
      setIsEditing(false);

      toast({
        title: '保存成功',
        description: '您的个人资料已更新',
      });
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setFormData(originalData);
    setIsEditing(false);
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-2 text-white">
              <User className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">个人资料</CardTitle>
              <CardDescription>管理您的个人信息</CardDescription>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>编辑资料</Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 头像 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <div>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                上传头像
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                支持 JPG、PNG 格式，不超过 2MB
              </p>
            </div>
          )}
        </motion.div>

        {/* 表单字段 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 姓名 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="name">
              <User className="mr-2 inline h-4 w-4" />
              姓名
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
            />
          </motion.div>

          {/* 邮箱 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <Label htmlFor="email">
              <Mail className="mr-2 inline h-4 w-4" />
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </motion.div>

          {/* 手机号 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="phone">
              <Phone className="mr-2 inline h-4 w-4" />
              手机号
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </motion.div>

          {/* 生日 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <Label htmlFor="birthday">
              <Calendar className="mr-2 inline h-4 w-4" />
              生日
            </Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              disabled={!isEditing}
            />
          </motion.div>

          {/* 性别 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="gender">性别</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
              disabled={!isEditing}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="请选择性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* 地区 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <Label htmlFor="location">
              <MapPin className="mr-2 inline h-4 w-4" />
              地区
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!isEditing}
            />
          </motion.div>
        </div>

        {/* 个人简介 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="bio">个人简介</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing}
            rows={4}
            placeholder="介绍一下你自己..."
          />
          <p className="text-xs text-muted-foreground">
            {formData.bio.length}/200 字符
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
