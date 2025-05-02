import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Search, Filter, Eye, MoreHorizontal } from "lucide-react";
import { Conversation } from "@shared/schema";

interface ConversationsTableProps {
  onViewConversation: (conversation: Conversation) => void;
}

export default function ConversationsTable({ onViewConversation }: ConversationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/conversations', { page: currentPage, status: statusFilter, search: searchQuery }],
  });

  const totalPages = data?.totalPages || 1;
  const conversations = data?.conversations || [];
  const totalConversations = data?.total || 0;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-200 text-green-800">Active</span>;
      case 'paused':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-200 text-yellow-800">Paused</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-200 text-blue-800">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-200 text-red-800">Failed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-slate-200 text-slate-800">Unknown</span>;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically re-fetch when searchQuery changes
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card className="bg-slate-800 rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h2 className="text-lg font-medium">Recent Conversations</h2>
        <div className="flex flex-wrap gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-8 pr-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="bg-slate-700 border border-slate-600 rounded-md h-9 w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="default" size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">
            <Filter className="h-4 w-4 mr-1" /> Filters
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-750">
            <TableRow>
              <TableHead className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User/Contact</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Started</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Message</TableHead>
              <TableHead className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tokens</TableHead>
              <TableHead className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-slate-800 divide-y divide-slate-700">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-4 text-center text-slate-400">
                  Loading conversations...
                </TableCell>
              </TableRow>
            ) : conversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-4 text-center text-slate-400">
                  No conversations found.
                </TableCell>
              </TableRow>
            ) : (
              conversations.map((conversation) => (
                <TableRow
                  key={conversation.id}
                  className="hover:bg-slate-750 cursor-pointer"
                  onClick={() => onViewConversation(conversation)}
                >
                  <TableCell className="whitespace-nowrap text-sm font-medium">
                    {conversation.displayId}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full bg-${conversation.avatarColor}-100 flex items-center justify-center text-${conversation.avatarColor}-700`}>
                        {conversation.avatarText}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium">{conversation.userName}</div>
                        <div className="text-xs text-slate-400">{conversation.userContact}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {getStatusBadge(conversation.status)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-400">
                    {conversation.startedTimeAgo}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-300">
                    {conversation.lastMessagePreview}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-slate-400">
                    {conversation.tokenCount}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary-400 hover:text-primary-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewConversation(conversation);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-400">
          Showing <span className="font-medium">{conversations.length ? (currentPage - 1) * 10 + 1 : 0}</span> to{" "}
          <span className="font-medium">
            {Math.min(currentPage * 10, totalConversations)}
          </span>{" "}
          of <span className="font-medium">{totalConversations}</span> conversations
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "px-3 py-1 rounded-md bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                    : "px-3 py-1 rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                }
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
              // Show current page and adjacent pages
              let pageNum = currentPage;
              if (i === 0) pageNum = Math.max(currentPage - 1, 1);
              if (i === 2) pageNum = Math.min(currentPage + 1, totalPages);
              if (i === 1) pageNum = currentPage;
              
              if (pageNum > totalPages) return null;
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      pageNum === currentPage
                        ? "px-3 py-1 rounded-md bg-primary-500 text-white"
                        : "px-3 py-1 rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                    }
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === totalPages
                    ? "px-3 py-1 rounded-md bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                    : "px-3 py-1 rounded-md bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                }
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
}
