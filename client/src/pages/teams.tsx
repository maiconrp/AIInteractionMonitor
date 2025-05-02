import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, User, UserPlus, UserMinus, Mail, Settings, Shield, Plus, Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Sample team member data
const TEAM_MEMBERS = [
  {
    id: "1",
    name: "Olivia Martinez",
    email: "olivia.martinez@example.com",
    role: "Admin",
    status: "active",
    avatar: "",
    department: "Customer Support",
    lastActive: "Just now"
  },
  {
    id: "2",
    name: "Ethan Wilson",
    email: "ethan.wilson@example.com",
    role: "Agent",
    status: "active",
    avatar: "",
    department: "Technical Support",
    lastActive: "5 minutes ago"
  },
  {
    id: "3",
    name: "Sophia Johnson",
    email: "sophia.johnson@example.com",
    role: "Supervisor",
    status: "active",
    avatar: "",
    department: "Customer Support",
    lastActive: "1 hour ago"
  },
  {
    id: "4",
    name: "William Chen",
    email: "william.chen@example.com",
    role: "Agent",
    status: "away",
    avatar: "",
    department: "Technical Support",
    lastActive: "Yesterday"
  },
  {
    id: "5",
    name: "Emma Davis",
    email: "emma.davis@example.com",
    role: "Agent",
    status: "inactive",
    avatar: "",
    department: "Sales",
    lastActive: "3 days ago"
  }
];

// Sample team data
const TEAMS = [
  {
    id: "1",
    name: "Customer Support",
    description: "Handle general customer inquiries",
    members: 12,
    activeConversations: 8
  },
  {
    id: "2",
    name: "Technical Support",
    description: "Handle technical issues and product questions",
    members: 8,
    activeConversations: 5
  },
  {
    id: "3",
    name: "Sales",
    description: "Handle sales inquiries and demos",
    members: 6,
    activeConversations: 3
  },
  {
    id: "4",
    name: "Billing Support",
    description: "Handle billing and payment inquiries",
    members: 4,
    activeConversations: 2
  }
];

export default function Teams() {
  const [newMemberOpen, setNewMemberOpen] = useState(false);
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // This would fetch real data in a production app
  const { data: teamMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['/api/team-members'],
    queryFn: () => Promise.resolve(TEAM_MEMBERS)
  });

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: () => Promise.resolve(TEAMS)
  });

  // Filter team members based on search and filters
  const filteredMembers = teamMembers?.filter(member => {
    const matchesSearch = 
      searchQuery === "" || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = 
      roleFilter === "all" || 
      member.role.toLowerCase() === roleFilter.toLowerCase();
    
    const matchesStatus = 
      statusFilter === "all" || 
      member.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDepartment = 
      departmentFilter === "all" || 
      member.department.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'supervisor':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'agent':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
      case 'away':
        return 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-500 hover:bg-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-500 hover:bg-slate-500/30';
    }
  };

  return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Team Management</h1>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="bg-slate-800 rounded-lg p-1 mb-4">
            <TabsTrigger 
              value="members"
              className="py-2 px-4 rounded-md data-[state=active]:text-white data-[state=active]:bg-primary-500 data-[state=active]:shadow-sm"
            >
              <User className="mr-2 h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger 
              value="teams"
              className="py-2 px-4 rounded-md data-[state=active]:text-white data-[state=active]:bg-primary-500 data-[state=active]:shadow-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Teams & Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Team Members</CardTitle>
                  <Dialog open={newMemberOpen} onOpenChange={setNewMemberOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20">
                        <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Add New Team Member</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Fill out the form below to add a new team member.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select>
                              <SelectTrigger id="role" className="bg-slate-700 border-slate-600">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Select>
                              <SelectTrigger id="department" className="bg-slate-700 border-slate-600">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer_support">Customer Support</SelectItem>
                                <SelectItem value="technical_support">Technical Support</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => setNewMemberOpen(false)}
                          variant="outline" 
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600 shadow-sm shadow-slate-900/50"
                        >
                          Cancel
                        </Button>
                        <Button className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20">
                          <UserPlus className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Manage team members and their access levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        placeholder="Search members by name or email..."
                        className="pl-10 bg-slate-700 border-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Filter by department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="customer support">Customer Support</SelectItem>
                        <SelectItem value="technical support">Technical Support</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border border-slate-700">
                  <div className="grid grid-cols-12 text-sm bg-slate-700 px-4 py-3 rounded-t-md">
                    <div className="col-span-3 font-medium">Name</div>
                    <div className="col-span-3 font-medium">Email</div>
                    <div className="col-span-2 font-medium">Role</div>
                    <div className="col-span-2 font-medium">Status</div>
                    <div className="col-span-2 font-medium text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {filteredMembers?.map((member) => (
                      <div key={member.id} className="grid grid-cols-12 px-4 py-3 items-center">
                        <div className="col-span-3 flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary-500/20 text-primary-500">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-slate-400">{member.department}</div>
                          </div>
                        </div>
                        <div className="col-span-3 text-slate-300">{member.email}</div>
                        <div className="col-span-2">
                          <Badge className={`${getRoleColor(member.role)} shadow-sm`}>{member.role}</Badge>
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              member.status === 'active' ? 'bg-green-500' : 
                              member.status === 'away' ? 'bg-amber-500' : 
                              'bg-slate-500'
                            }`}></div>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>View Profile</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Send Email</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Change Role</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 cursor-pointer">
                                <UserMinus className="mr-2 h-4 w-4" />
                                <span>Deactivate</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card className="bg-slate-800 border border-slate-700 shadow-md shadow-slate-900/50 rounded-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Teams & Departments</CardTitle>
                  <Dialog open={newTeamOpen} onOpenChange={setNewTeamOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20">
                        <Plus className="mr-2 h-4 w-4" /> Create Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Fill out the form below to create a new team or department.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="teamName">Team Name</Label>
                          <Input
                            id="teamName"
                            placeholder="e.g. Enterprise Support"
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="teamDescription">Description</Label>
                          <Input
                            id="teamDescription"
                            placeholder="Brief description of this team's purpose"
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="assignMembers">Assign Team Members</Label>
                          <Select>
                            <SelectTrigger id="assignMembers" className="bg-slate-700 border-slate-600">
                              <SelectValue placeholder="Select members" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="olivia">Olivia Martinez</SelectItem>
                              <SelectItem value="ethan">Ethan Wilson</SelectItem>
                              <SelectItem value="sophia">Sophia Johnson</SelectItem>
                              <SelectItem value="william">William Chen</SelectItem>
                              <SelectItem value="emma">Emma Davis</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-slate-400 mt-1">
                            You can add more members after creating the team.
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => setNewTeamOpen(false)}
                          variant="outline" 
                          className="bg-slate-700 border-slate-600 hover:bg-slate-600 shadow-sm shadow-slate-900/50"
                        >
                          Cancel
                        </Button>
                        <Button className="bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-300/20">
                          <Plus className="mr-2 h-4 w-4" /> Create Team
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Manage teams and departments for your organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams?.map((team) => (
                    <Card key={team.id} className="bg-slate-700 border-slate-600 shadow-sm shadow-slate-900/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                              <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-700" />
                              <DropdownMenuItem className="cursor-pointer">
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span>Add Members</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Edit Team</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 cursor-pointer">
                                <UserMinus className="mr-2 h-4 w-4" />
                                <span>Delete Team</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription className="text-slate-300">
                          {team.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-300">Members:</span>
                          </div>
                          <Badge variant="outline" className="bg-slate-600 border-slate-500 shadow-sm">
                            {team.members}
                          </Badge>
                        </div>
                        <Separator className="bg-slate-600 my-2" />
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-300">Active Conversations:</span>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500 shadow-sm">
                            {team.activeConversations}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button 
                          variant="outline" 
                          className="w-full bg-slate-600 border-slate-500 hover:bg-slate-500 shadow-sm shadow-slate-900/50"
                        >
                          Manage Team
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}