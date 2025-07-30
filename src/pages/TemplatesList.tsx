import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import PracticeTemplateCard from "@/components/practice/PracticeTemplateCard";
import { fetchAllTemplates } from "@/services/practiceService";
import { PracticeTemplate } from "@/types/practice";
import { useToast } from "@/hooks/use-toast";

const TemplatesList: React.FC = () => {
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get unique tags from templates
  const allTags = Array.from(
    new Set(templates.flatMap(template => template.tags || []))
  );

  // Filter templates based on search and tag
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.creator?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || template.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const loadTemplates = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const { templates: data, totalCount: count } = await fetchAllTemplates(page, pageSize);
      setTemplates(data);
      setTotalCount(count);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast({
        title: "Error loading templates",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Community Templates</h1>
          <p className="text-muted-foreground">
            Discover practice routines shared by the community and explore templates created by other musicians.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates by title, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {(searchQuery || selectedTag) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(pageSize).fill(null).map((_, index) => (
                <div 
                  key={`loading-${index}`} 
                  className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm animate-pulse h-72" 
                />
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                  <PracticeTemplateCard key={template.id} template={template} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && !searchQuery && !selectedTag && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery || selectedTag ? (
                  <>No templates found matching your filters.</>
                ) : (
                  <>No practice templates available yet.</>
                )}
              </div>
              {(searchQuery || selectedTag) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TemplatesList;