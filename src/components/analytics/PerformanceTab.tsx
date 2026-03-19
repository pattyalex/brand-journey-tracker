import React, { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown, BarChart, Copy, ExternalLink, RefreshCw } from "lucide-react";
import CreateSimilarContentDialog from "./CreateSimilarContentDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TimeFilterSelect from "./TimeFilterSelect";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortDescriptionLabel?: string;
  render: (item: T) => ReactNode;
}

export interface PerformanceTabConfig<T> {
  title: string;
  cardTitle?: string;
  emptyMessage: string;
  items: T[];
  columns: ColumnDef<T>[];
  defaultSortKey: string;
  /** Get a display title for the "create similar" dialog */
  getItemTitle: (item: T) => string;
  /** Get the platform string */
  getItemPlatform: (item: T) => string;
  /** Get the URL for "view content" */
  getItemUrl: (item: T) => string;
  /** Get the item's unique key */
  getItemKey: (item: T) => string;
  /** Render the thumbnail cell (first column). Receives item + platform icon + view/recreate buttons. */
  renderContentCell: (item: T, helpers: ContentCellHelpers) => ReactNode;
  /** Optional: filter available platforms in the dropdown */
  filterPlatforms?: (platforms: string[]) => string[];
  /** Optional: render content above the table (e.g., charts) */
  renderAboveTable?: () => ReactNode;
  /** Optional: check if there are relevant platforms, show empty state if not */
  hasPlatformCheck?: (platforms: string[]) => boolean;
  /** Optional: empty state when no relevant platforms */
  noPlatformMessage?: ReactNode;
  /** Data type label for logs */
  dataTypeLabel: string;
}

export interface ContentCellHelpers {
  handleCreateSimilar: () => void;
  handleViewContent: () => void;
}

function getSortDescription<T>(sortBy: string, columns: ColumnDef<T>[]): string {
  const col = columns.find(c => c.key === sortBy);
  return col?.sortDescriptionLabel || col?.label?.toLowerCase() || sortBy;
}

function PerformanceTab<T>({
  config,
  platforms,
}: {
  config: PerformanceTabConfig<T>;
  platforms: string[];
}) {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState(config.defaultSortKey);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ title: string; platform: string } | null>(null);
  const [timeRange, setTimeRange] = useState("last30days");

  // Platform availability check
  if (config.hasPlatformCheck && !config.hasPlatformCheck(platforms)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4 py-8">
            <BarChart className="mx-auto h-12 w-12 text-muted-foreground/60" />
            {config.noPlatformMessage || <p>No data available.</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayPlatforms = config.filterPlatforms ? config.filterPlatforms(platforms) : platforms;

  const filteredItems = selectedPlatform === "All"
    ? config.items.filter(item => platforms.includes(config.getItemPlatform(item)))
    : config.items.filter(item => config.getItemPlatform(item) === selectedPlatform);

  const sortedItems = [...filteredItems].sort((a, b) => {
    const multiplier = sortOrder === "desc" ? -1 : 1;
    return multiplier * ((a as any)[sortBy] > (b as any)[sortBy] ? 1 : -1);
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleCreateSimilar = (item: T) => {
    setSelectedContent({
      title: config.getItemTitle(item),
      platform: config.getItemPlatform(item),
    });
    setIsCreateDialogOpen(true);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    console.log(`Fetching ${config.dataTypeLabel} data for time range: ${range}`);
  };

  const handleCustomDateChange = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (startDate && endDate) {
      console.log(`Fetching ${config.dataTypeLabel} data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }
  };

  const handleViewContent = (url: string) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">{config.title}</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <TimeFilterSelect
            selectedRange={timeRange}
            onDateRangeChange={handleTimeRangeChange}
            onCustomDateChange={handleCustomDateChange}
          />
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Platforms</SelectItem>
              {displayPlatforms.map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {config.renderAboveTable?.()}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{config.cardTitle || "Performance Metrics"}</CardTitle>
            <CardDescription>
              Sorted by {getSortDescription(sortBy, config.columns)}
              {sortOrder === "desc" ? " (highest first)" : " (lowest first)"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Copy className="h-4 w-4" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{config.title.replace(" Performance", "")}</TableHead>
                {config.columns.map(col => (
                  <TableHead key={col.key}>
                    {col.sortable !== false ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 -ml-3"
                      >
                        {col.label}
                        {sortBy === col.key &&
                          (sortOrder === "desc" ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          ))}
                      </Button>
                    ) : (
                      col.label
                    )}
                  </TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map(item => (
                <TableRow key={config.getItemKey(item)}>
                  <TableCell>
                    {config.renderContentCell(item, {
                      handleCreateSimilar: () => handleCreateSimilar(item),
                      handleViewContent: () => handleViewContent(config.getItemUrl(item)),
                    })}
                  </TableCell>
                  {config.columns.map(col => (
                    <TableCell key={col.key}>{col.render(item)}</TableCell>
                  ))}
                  <TableCell className="text-right" />
                </TableRow>
              ))}
              {sortedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={config.columns.length + 2} className="text-center py-8">
                    <BarChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p>{config.emptyMessage}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateSimilarContentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        contentDetails={selectedContent}
        onSave={() => setIsCreateDialogOpen(false)}
        onCancel={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}

/** Reusable recreate button + thumbnail + info cell */
export function ContentCellLayout({
  thumbnailSrc,
  thumbnailAlt,
  thumbnailClassName,
  title,
  subtitle,
  helpers,
}: {
  thumbnailSrc: string;
  thumbnailAlt: string;
  thumbnailClassName: string;
  title: ReactNode;
  subtitle: ReactNode;
  helpers: ContentCellHelpers;
}) {
  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={helpers.handleCreateSimilar}
              className="h-8 w-8 rounded-full"
            >
              <RefreshCw className="h-4 w-4 text-purple-500 stroke-[2.5]" strokeWidth={2.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recreate content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className={`relative ${thumbnailClassName} rounded overflow-hidden`}>
        <img src={thumbnailSrc} alt={thumbnailAlt} className="object-cover w-full h-full" />
      </div>
      <div>
        <div className="font-medium truncate max-w-xs">{title}</div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
          {subtitle}
          <Button
            variant="outline"
            size="xs"
            className="ml-2 flex items-center gap-1"
            onClick={helpers.handleViewContent}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PerformanceTab;
