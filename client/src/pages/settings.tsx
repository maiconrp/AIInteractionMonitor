import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Bell, Shield, Database, Bot, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [generalSettings, setGeneralSettings] = useState({
    systemName: "AI Conversation Monitoring Hub",
    timeZone: "UTC",
    dateFormat: "MM/DD/YYYY",
    darkMode: theme === "dark"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    failedConversations: true,
    takenOverConversations: true,
    newConversations: false,
    dailyDigest: true,
    emailAddress: "admin@example.com"
  });

  const [aiSettings, setAiSettings] = useState({
    defaultModel: "GPT-4",
    maxTokens: "4096",
    temperature: "0.7",
    failureThreshold: "3",
    autoTakeover: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
    ipRestriction: false,
    twoFactorAuth: false,
    allowedIPs: "",
    logLevel: "info"
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    whatsappEnabled: true,
    whatsappAPIKey: "••••••••••••••••",
    telegramEnabled: false,
    telegramAPIKey: "",
    webhookURL: "https://hooks.example.com/conversationhub",
    webhookEvents: ["conversation.created", "conversation.completed"]
  });

  const handleSaveSettings = (settingsType: string) => {
    // In a real application, this would save to the backend
    toast({
      title: "Settings saved",
      description: `Your ${settingsType} settings have been saved.`,
    });
  };

  const toggleDarkMode = (checked: boolean) => {
    setGeneralSettings({
      ...generalSettings,
      darkMode: checked
    });
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-400">Configure your AI Conversation Monitoring Hub</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-750 grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="general" className="data-[state=active]:bg-slate-700">General</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700">Notifications</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-slate-700">AI Settings</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">Security</TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-slate-700">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="systemName">System Name</Label>
                  <Input 
                    id="systemName" 
                    value={generalSettings.systemName}
                    onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select 
                      value={generalSettings.timeZone}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, timeZone: value})}
                    >
                      <SelectTrigger id="timeZone" className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={generalSettings.dateFormat}
                      onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                    >
                      <SelectTrigger id="dateFormat" className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="darkMode" className="flex items-center gap-2 cursor-pointer">
                    {generalSettings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>{generalSettings.darkMode ? "Dark Mode" : "Light Mode"}</span>
                  </Label>
                  <Switch 
                    id="darkMode" 
                    checked={generalSettings.darkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-700 pt-4 flex justify-between">
              <Button variant="outline" className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                Reset to Default
              </Button>
              <Button 
                className="bg-primary-500 hover:bg-primary-600"
                onClick={() => handleSaveSettings('general')}
              >
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" /> Notification Settings
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="emailAddress">Email Address for Notifications</Label>
                  <Input 
                    id="emailAddress"
                    type="email"
                    value={notificationSettings.emailAddress}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailAddress: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <Separator className="bg-slate-700" />
                
                <h3 className="text-md font-medium">Notification Preferences</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="emailNotifications" className="cursor-pointer">
                    Email Notifications
                  </Label>
                  <Switch 
                    id="emailNotifications" 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="failedConversations" className="cursor-pointer">
                    Failed Conversations
                  </Label>
                  <Switch 
                    id="failedConversations" 
                    checked={notificationSettings.failedConversations}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, failedConversations: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="takenOverConversations" className="cursor-pointer">
                    Taken Over Conversations
                  </Label>
                  <Switch 
                    id="takenOverConversations" 
                    checked={notificationSettings.takenOverConversations}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, takenOverConversations: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="newConversations" className="cursor-pointer">
                    New Conversations
                  </Label>
                  <Switch 
                    id="newConversations" 
                    checked={notificationSettings.newConversations}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newConversations: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="dailyDigest" className="cursor-pointer">
                    Daily Digest
                  </Label>
                  <Switch 
                    id="dailyDigest" 
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dailyDigest: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-700 pt-4 flex justify-end">
              <Button 
                className="bg-primary-500 hover:bg-primary-600"
                onClick={() => handleSaveSettings('notification')}
              >
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5" /> AI Settings
              </CardTitle>
              <CardDescription>Configure AI model parameters and behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="defaultModel">Default AI Model</Label>
                  <Select 
                    value={aiSettings.defaultModel}
                    onValueChange={(value) => setAiSettings({...aiSettings, defaultModel: value})}
                  >
                    <SelectTrigger id="defaultModel" className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GPT-4">GPT-4</SelectItem>
                      <SelectItem value="GPT-3.5">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="Claude">Claude</SelectItem>
                      <SelectItem value="Llama">Llama 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input 
                      id="maxTokens"
                      type="number"
                      value={aiSettings.maxTokens}
                      onChange={(e) => setAiSettings({...aiSettings, maxTokens: e.target.value})}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input 
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings({...aiSettings, temperature: e.target.value})}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="failureThreshold">Failure Threshold</Label>
                    <Input 
                      id="failureThreshold"
                      type="number"
                      value={aiSettings.failureThreshold}
                      onChange={(e) => setAiSettings({...aiSettings, failureThreshold: e.target.value})}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="autoTakeover" className="cursor-pointer">
                    Auto Takeover on Failures
                  </Label>
                  <Switch 
                    id="autoTakeover" 
                    checked={aiSettings.autoTakeover}
                    onCheckedChange={(checked) => setAiSettings({...aiSettings, autoTakeover: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-700 pt-4 flex justify-end">
              <Button 
                className="bg-primary-500 hover:bg-primary-600"
                onClick={() => handleSaveSettings('AI')}
              >
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Security Settings
              </CardTitle>
              <CardDescription>Configure security and access control settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select 
                    value={securitySettings.logLevel}
                    onValueChange={(value) => setSecuritySettings({...securitySettings, logLevel: value})}
                  >
                    <SelectTrigger id="logLevel" className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="twoFactorAuth" className="cursor-pointer">
                    Two-Factor Authentication
                  </Label>
                  <Switch 
                    id="twoFactorAuth" 
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="ipRestriction" className="cursor-pointer">
                    IP Restriction
                  </Label>
                  <Switch 
                    id="ipRestriction" 
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipRestriction: checked})}
                  />
                </div>
                
                {securitySettings.ipRestriction && (
                  <div className="grid gap-2">
                    <Label htmlFor="allowedIPs">Allowed IP Addresses (comma separated)</Label>
                    <Input 
                      id="allowedIPs"
                      value={securitySettings.allowedIPs}
                      onChange={(e) => setSecuritySettings({...securitySettings, allowedIPs: e.target.value})}
                      className="bg-slate-700 border-slate-600"
                      placeholder="192.168.1.1, 10.0.0.1, etc."
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-700 pt-4 flex justify-end">
              <Button 
                className="bg-primary-500 hover:bg-primary-600"
                onClick={() => handleSaveSettings('security')}
              >
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" /> Integration Settings
              </CardTitle>
              <CardDescription>Configure external service integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-md font-medium">Messaging Platforms</h3>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="whatsappEnabled" className="cursor-pointer">
                      WhatsApp Integration
                    </Label>
                    <Switch 
                      id="whatsappEnabled" 
                      checked={integrationSettings.whatsappEnabled}
                      onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, whatsappEnabled: checked})}
                    />
                  </div>
                  
                  {integrationSettings.whatsappEnabled && (
                    <div className="grid gap-2 mt-2">
                      <Label htmlFor="whatsappAPIKey">WhatsApp API Key</Label>
                      <Input 
                        id="whatsappAPIKey"
                        type="password"
                        value={integrationSettings.whatsappAPIKey}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, whatsappAPIKey: e.target.value})}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="telegramEnabled" className="cursor-pointer">
                      Telegram Integration
                    </Label>
                    <Switch 
                      id="telegramEnabled" 
                      checked={integrationSettings.telegramEnabled}
                      onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, telegramEnabled: checked})}
                    />
                  </div>
                  
                  {integrationSettings.telegramEnabled && (
                    <div className="grid gap-2 mt-2">
                      <Label htmlFor="telegramAPIKey">Telegram API Key</Label>
                      <Input 
                        id="telegramAPIKey"
                        type="password"
                        value={integrationSettings.telegramAPIKey}
                        onChange={(e) => setIntegrationSettings({...integrationSettings, telegramAPIKey: e.target.value})}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  )}
                </div>
                
                <Separator className="bg-slate-700" />
                
                <h3 className="text-md font-medium">Webhooks</h3>
                
                <div className="grid gap-2">
                  <Label htmlFor="webhookURL">Webhook URL</Label>
                  <Input 
                    id="webhookURL"
                    value={integrationSettings.webhookURL}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, webhookURL: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Webhook Events</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {["conversation.created", "conversation.completed", "conversation.failed", "conversation.takeover", "metrics.updated"].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event}
                          className="h-4 w-4 rounded border-slate-600 text-primary-500 focus:ring-primary-500"
                          checked={integrationSettings.webhookEvents.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIntegrationSettings({
                                ...integrationSettings,
                                webhookEvents: [...integrationSettings.webhookEvents, event]
                              });
                            } else {
                              setIntegrationSettings({
                                ...integrationSettings,
                                webhookEvents: integrationSettings.webhookEvents.filter(e => e !== event)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={event} className="cursor-pointer">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-700 pt-4 flex justify-between">
              <Button variant="outline" className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                <RefreshCw className="mr-2 h-4 w-4" /> Test Webhook
              </Button>
              <Button 
                className="bg-primary-500 hover:bg-primary-600"
                onClick={() => handleSaveSettings('integration')}
              >
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}