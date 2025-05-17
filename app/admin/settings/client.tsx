"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSettingsClient() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "InfoBox",
    siteDescription: "최신 정보와 트렌드를 만나보세요",
    siteUrl: "https://example.com",
    allowComments: true,
    allowRegistration: true,
    maintenanceMode: false,
  })

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "InfoBox - 최신 정보와 트렌드",
    metaDescription: "기술, 디자인, 비즈니스 등 다양한 분야의 유용한 정보를 제공하는 블로그 플랫폼입니다.",
    googleAnalyticsId: "",
    googleSiteVerification: "",
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
  })

  const handleGeneralSettingsChange = (key: string, value: string | boolean) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSeoSettingsChange = (key: string, value: string) => {
    setSeoSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleEmailSettingsChange = (key: string, value: string) => {
    setEmailSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async (section: string) => {
    // TODO: API 엔드포인트 구현 후 저장 로직 추가
    console.log(`Saving ${section} settings...`)
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">일반</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="email">이메일</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>일반 설정</CardTitle>
            <CardDescription>사이트의 기본 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">사이트 이름</Label>
              <Input
                id="siteName"
                value={generalSettings.siteName}
                onChange={(e) => handleGeneralSettingsChange("siteName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">사이트 설명</Label>
              <Input
                id="siteDescription"
                value={generalSettings.siteDescription}
                onChange={(e) => handleGeneralSettingsChange("siteDescription", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">사이트 URL</Label>
              <Input
                id="siteUrl"
                value={generalSettings.siteUrl}
                onChange={(e) => handleGeneralSettingsChange("siteUrl", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowComments">댓글 허용</Label>
              <Switch
                id="allowComments"
                checked={generalSettings.allowComments}
                onCheckedChange={(checked) => handleGeneralSettingsChange("allowComments", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowRegistration">회원가입 허용</Label>
              <Switch
                id="allowRegistration"
                checked={generalSettings.allowRegistration}
                onCheckedChange={(checked) => handleGeneralSettingsChange("allowRegistration", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">유지보수 모드</Label>
              <Switch
                id="maintenanceMode"
                checked={generalSettings.maintenanceMode}
                onCheckedChange={(checked) => handleGeneralSettingsChange("maintenanceMode", checked)}
              />
            </div>
            <Button onClick={() => handleSaveSettings("general")}>설정 저장</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seo">
        <Card>
          <CardHeader>
            <CardTitle>SEO 설정</CardTitle>
            <CardDescription>검색 엔진 최적화 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">메타 제목</Label>
              <Input
                id="metaTitle"
                value={seoSettings.metaTitle}
                onChange={(e) => handleSeoSettingsChange("metaTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">메타 설명</Label>
              <Input
                id="metaDescription"
                value={seoSettings.metaDescription}
                onChange={(e) => handleSeoSettingsChange("metaDescription", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={seoSettings.googleAnalyticsId}
                onChange={(e) => handleSeoSettingsChange("googleAnalyticsId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleSiteVerification">Google 사이트 인증</Label>
              <Input
                id="googleSiteVerification"
                value={seoSettings.googleSiteVerification}
                onChange={(e) => handleSeoSettingsChange("googleSiteVerification", e.target.value)}
              />
            </div>
            <Button onClick={() => handleSaveSettings("seo")}>설정 저장</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="email">
        <Card>
          <CardHeader>
            <CardTitle>이메일 설정</CardTitle>
            <CardDescription>이메일 발송 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP 호스트</Label>
              <Input
                id="smtpHost"
                value={emailSettings.smtpHost}
                onChange={(e) => handleEmailSettingsChange("smtpHost", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP 포트</Label>
              <Input
                id="smtpPort"
                value={emailSettings.smtpPort}
                onChange={(e) => handleEmailSettingsChange("smtpPort", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP 사용자</Label>
              <Input
                id="smtpUser"
                value={emailSettings.smtpUser}
                onChange={(e) => handleEmailSettingsChange("smtpUser", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP 비밀번호</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => handleEmailSettingsChange("smtpPassword", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">발신자 이메일</Label>
              <Input
                id="fromEmail"
                value={emailSettings.fromEmail}
                onChange={(e) => handleEmailSettingsChange("fromEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">발신자 이름</Label>
              <Input
                id="fromName"
                value={emailSettings.fromName}
                onChange={(e) => handleEmailSettingsChange("fromName", e.target.value)}
              />
            </div>
            <Button onClick={() => handleSaveSettings("email")}>설정 저장</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 