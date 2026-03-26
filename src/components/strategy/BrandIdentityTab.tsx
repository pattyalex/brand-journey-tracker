import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Target, Users, MessageSquare, ImageIcon,
  Check, Sparkles, X, Plus, ArrowUpRight,
  Upload, Trash2, StickyNote, FileText
} from "lucide-react";

interface BrandIdentityTabProps {
  missionStatement: string;
  setMissionStatement: (v: string) => void;
  missionStatementFocused: boolean;
  setMissionStatementFocused: (v: boolean) => void;
  showMissionSaved: boolean;
  brandValues: string[];
  setBrandValues: (v: string[]) => void;
  customValueInput: string;
  setCustomValueInput: (v: string) => void;
  editingValueIndex: number | null;
  setEditingValueIndex: (v: number | null) => void;
  editingValueText: string;
  setEditingValueText: (v: string) => void;
  selectedTones: string[];
  setSelectedTones: (v: string[]) => void;
  audienceAgeRanges: string[];
  setAudienceAgeRanges: (v: string[]) => void;
  audienceStruggles: string;
  setAudienceStruggles: (v: string) => void;
  audienceDesires: string;
  setAudienceDesires: (v: string) => void;
  strugglesFocused: boolean;
  setStrugglesFocused: (v: boolean) => void;
  desiresFocused: boolean;
  setDesiresFocused: (v: boolean) => void;
  visionBoardImages: string[];
  removeVisionBoardImage: (index: number) => void;
  pinterestUrl: string;
  updatePinterestUrl: (url: string) => void;
  showPinterestInput: boolean;
  setShowPinterestInput: (v: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUploadClick: () => void;
  handleVisionBoardUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalNotes: string;
  setAdditionalNotes: (v: string) => void;
  noteLinks: { url: string; title: string }[];
  setNoteLinks: (v: { url: string; title: string }[]) => void;
  noteFiles: { name: string; data: string }[];
  setNoteFiles: (v: { name: string; data: string }[]) => void;
  newLinkUrl: string;
  setNewLinkUrl: (v: string) => void;
  newLinkTitle: string;
  setNewLinkTitle: (v: string) => void;
  showAddLinkForm: boolean;
  setShowAddLinkForm: (v: boolean) => void;
  onSaveAll: () => void;
  showSaveSuccess: boolean;
}

const BrandIdentityTab: React.FC<BrandIdentityTabProps> = (props) => {
  const {
    missionStatement, setMissionStatement,
    missionStatementFocused, setMissionStatementFocused,
    showMissionSaved,
    brandValues, setBrandValues,
    customValueInput, setCustomValueInput,
    editingValueIndex, setEditingValueIndex,
    editingValueText, setEditingValueText,
    selectedTones, setSelectedTones,
    audienceAgeRanges, setAudienceAgeRanges,
    audienceStruggles, setAudienceStruggles,
    audienceDesires, setAudienceDesires,
    strugglesFocused, setStrugglesFocused,
    desiresFocused, setDesiresFocused,
    visionBoardImages, removeVisionBoardImage,
    pinterestUrl, updatePinterestUrl,
    showPinterestInput, setShowPinterestInput,
    fileInputRef, handleUploadClick, handleVisionBoardUpload,
    additionalNotes, setAdditionalNotes,
    noteLinks, setNoteLinks,
    noteFiles, setNoteFiles,
    newLinkUrl, setNewLinkUrl,
    newLinkTitle, setNewLinkTitle,
    showAddLinkForm, setShowAddLinkForm,
    onSaveAll, showSaveSuccess,
  } = props;

  return (
    <TabsContent value="brand-identity" className="space-y-4 mt-0">
      {/* Mission Statement */}
      <Card id="mission" className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)] scroll-mt-24">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <Target className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#612A4F]">Mission Statement</span>
            {missionStatement.trim() && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
            {showMissionSaved && (
              <div className="flex items-center gap-1 px-2 py-0.5 text-[#8B7082] text-xs font-medium animate-in fade-in duration-200">
                <Check className="w-3 h-3" />
                Saved
              </div>
            )}
          </CardTitle>
          <CardDescription className="ml-11 text-sm text-gray-500">
            Why you create content and who you help
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="w-full">
              <Textarea
                value={missionStatement}
                onChange={(e) => {
                  const words = e.target.value.trim().split(/\s+/).filter(w => w.length > 0);
                  if (words.length <= 25 || e.target.value.length < missionStatement.length) {
                    setMissionStatement(e.target.value);
                  }
                }}
                className="min-h-[80px] w-full resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed bg-white"
                placeholder={missionStatementFocused ? "" : "Write a short sentence that explains who your content is for and what you want it to do for them..."}
                onFocus={() => setMissionStatementFocused(true)}
                onBlur={() => setMissionStatementFocused(false)}
              />
              <p className="text-[11px] text-[#8B7082] mt-1.5 text-right">
                {missionStatement.trim().split(/\s+/).filter(w => w.length > 0).length}/25 words
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-[#8B7082] mb-2">Examples</p>
              <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-2xl px-3 py-2 border-l-4 border-[#8B7082]/30">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "I create content to help busy people build healthy routines they can actually stick to.",
                    "I create content to inspire women to dress well without overthinking or overspending.",
                    "I create content to help small business founders scale their businesses without burning out."
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMissionStatement(example)}
                      className="text-left text-[12px] text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg px-2 py-2 transition-all"
                    >
                      <span className="leading-snug">"{example}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Values */}
      <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#612A4F]">Brand Values</span>
            {brandValues.length >= 3 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
          </CardTitle>
          <CardDescription className="ml-11 text-sm text-gray-500">
            Define 3–5 values that guide your content creation and personal brand
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={customValueInput}
                  onChange={(e) => setCustomValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customValueInput.trim() && brandValues.length < 5) {
                      e.preventDefault();
                      if (!brandValues.includes(customValueInput.trim())) {
                        setBrandValues([...brandValues, customValueInput.trim()]);
                        setCustomValueInput("");
                      }
                    }
                  }}
                  placeholder="Add a value (e.g., 'I don't take myself too seriously online')..."
                  disabled={brandValues.length >= 5}
                  className="flex-1 px-4 py-3 text-sm border border-[#E8E4E6] rounded-xl focus:outline-none focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  onClick={() => {
                    if (customValueInput.trim() && brandValues.length < 5 && !brandValues.includes(customValueInput.trim())) {
                      setBrandValues([...brandValues, customValueInput.trim()]);
                      setCustomValueInput("");
                    }
                  }}
                  disabled={!customValueInput.trim() || brandValues.length >= 5}
                  className="px-5 py-3 text-sm font-medium bg-[#8B7082] text-white rounded-lg hover:bg-[#7A6171] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>

              {brandValues.length > 0 && (
                <div>
                  <p className="text-[11px] text-gray-500 mb-3">Your values ({brandValues.length}/5)</p>
                  <div className="space-y-3">
                    {brandValues.map((value, index) => (
                      <div
                        key={index}
                        className="relative bg-white rounded-xl pl-5 pr-5 py-4 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <span className="absolute top-3 left-4 text-[#612A4F] text-4xl font-serif leading-none">{index + 1}</span>
                        {editingValueIndex === index ? (
                          <input
                            type="text"
                            value={editingValueText}
                            onChange={(e) => setEditingValueText(e.target.value)}
                            onBlur={() => {
                              if (editingValueText.trim()) {
                                const newValues = [...brandValues];
                                newValues[index] = editingValueText.trim();
                                setBrandValues(newValues);
                              }
                              setEditingValueIndex(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingValueText.trim()) {
                                  const newValues = [...brandValues];
                                  newValues[index] = editingValueText.trim();
                                  setBrandValues(newValues);
                                }
                                setEditingValueIndex(null);
                              } else if (e.key === 'Escape') {
                                setEditingValueIndex(null);
                              }
                            }}
                            autoFocus
                            className="w-full text-sm text-gray-700 pl-8 pr-6 leading-relaxed bg-transparent border-none outline-none focus:ring-0"
                          />
                        ) : (
                          <p
                            onClick={() => {
                              setEditingValueIndex(index);
                              setEditingValueText(value);
                            }}
                            className="text-sm text-gray-700 pl-8 pr-6 leading-relaxed cursor-text hover:text-gray-900"
                          >
                            "{value}"
                          </p>
                        )}
                        <button
                          onClick={() => setBrandValues(brandValues.filter((_, i) => i !== index))}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {brandValues.length < 3 && (
                <p className="text-xs text-amber-600">Add at least {3 - brandValues.length} more value{3 - brandValues.length > 1 ? 's' : ''}</p>
              )}
            </div>

            {/* Guidelines panel */}
            <div className="w-[420px] flex-shrink-0">
              <p className="text-[11px] text-[#8B7082] font-medium px-1 mb-3">Examples</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                  <p className="text-[11px] font-medium text-gray-700 mb-1">Alignment</p>
                  <p className="text-[10px] text-gray-400 mb-2">Being true to yourself</p>
                  <div className="space-y-1">
                    {[
                      "I won't say things I'm not fully aligned with just because they perform well",
                      "I won't promote brands I don't believe in, even if the money is good"
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          if (brandValues.length < 5 && !brandValues.includes(example)) {
                            setBrandValues([...brandValues, example]);
                          }
                        }}
                        className="block w-full text-left text-[10px] px-2 py-1.5 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                  <p className="text-[11px] font-medium text-gray-700 mb-1">Boundaries</p>
                  <p className="text-[10px] text-gray-400 mb-2">Your non-negotiables</p>
                  <div className="space-y-1">
                    {[
                      "No content that puts others down",
                      "I share everything about my life and show up fully as myself",
                      "I keep certain parts of my life private"
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          if (brandValues.length < 5 && !brandValues.includes(example)) {
                            setBrandValues([...brandValues, example]);
                          }
                        }}
                        className="block w-full text-left text-[10px] px-2 py-1.5 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                  <p className="text-[11px] font-medium text-gray-700 mb-1">Craft Values</p>
                  <p className="text-[10px] text-gray-400 mb-2">How you create</p>
                  <div className="flex flex-wrap gap-1">
                    {["Quality over quantity", "Taste over trends", "Post often without overthinking"].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          if (brandValues.length < 5 && !brandValues.includes(example)) {
                            setBrandValues([...brandValues, example]);
                          }
                        }}
                        className="text-[10px] px-2 py-1 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#FAF7F8] via-[#F5F0F3] to-[#F0EBE8] rounded-xl p-3 border-l-2 border-[#8B7082]/25">
                  <p className="text-[11px] font-medium text-gray-700 mb-1">Presence</p>
                  <p className="text-[10px] text-gray-400 mb-2">The energy people feel from you</p>
                  <div className="flex flex-wrap gap-1">
                    {["Self-respect", "Elegance", "Calm authority", "Boldness", "Confidence"].map((example) => (
                      <button
                        key={example}
                        onClick={() => {
                          if (brandValues.length < 5 && !brandValues.includes(example)) {
                            setBrandValues([...brandValues, example]);
                          }
                        }}
                        className="text-[10px] px-2 py-1 rounded-md bg-white text-gray-500 hover:bg-[#E8DDE5] hover:text-[#612A4F] transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Style */}
      <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#612A4F]">Content Style</span>
            {selectedTones.length > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
          </CardTitle>
          <CardDescription className="ml-11 text-sm text-gray-500">
            How you choose to deliver your message — select one or more
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-5 gap-3">
            {["Humorous", "Aspirational", "Warm", "Educational", "Relatable", "Motivational", "Bold", "Cinematic", "Calming", "Inspirational"].map((tone) => {
              const toneKey = tone.toLowerCase();
              const isSelected = selectedTones.includes(toneKey);
              return (
                <button
                  key={tone}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTones(selectedTones.filter(t => t !== toneKey));
                    } else {
                      setSelectedTones([...selectedTones, toneKey]);
                    }
                  }}
                  className={`py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isSelected
                      ? "bg-gradient-to-b from-[#6d3358] to-[#612A4F] text-white shadow-[0_2px_8px_rgba(97,42,79,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "bg-gradient-to-b from-white to-[#FAF7F8] text-[#6B5B63] hover:text-[#612A4F] hover:from-[#FAF7F8] hover:to-[#F5F0F3] border border-[#E8E4E6] hover:border-[#D5CDD2] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  {tone}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#612A4F]">Target Audience</span>
            {(audienceAgeRanges.length > 0 || audienceDesires.trim()) && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
          </CardTitle>
          <CardDescription className="ml-11 text-sm text-gray-500">
            Define who your ideal audience is
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 pb-6">
          <div className="space-y-3">
            <Label htmlFor="age-range" className="text-sm font-semibold text-gray-800">Age Range</Label>
            <div className="inline-flex rounded-xl border border-[#E8E4E6] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {["18-24", "25-34", "35-44", "45-54", "55+"].map((range, index) => {
                const isSelected = audienceAgeRanges.includes(range);
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setAudienceAgeRanges(audienceAgeRanges.filter(r => r !== range));
                      } else if (audienceAgeRanges.length < 3) {
                        setAudienceAgeRanges([...audienceAgeRanges, range]);
                      } else {
                        import("@/hooks/use-toast").then(({ showMaxAgeRangesSelectedToast }) => {
                          showMaxAgeRangesSelectedToast();
                        });
                      }
                    }}
                    className={`px-5 py-2.5 text-[13px] font-medium transition-all ${
                      index > 0 ? "border-l border-[#E8E4E6]" : ""
                    } ${
                      isSelected
                        ? "bg-gradient-to-b from-[#6d3358] to-[#612A4F] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-lg"
                        : "bg-gradient-to-b from-white to-[#FAF7F8] text-[#6B5B63] hover:text-[#612A4F] hover:from-[#FAF7F8] hover:to-[#F5F0F3]"
                    }`}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="struggles" className="text-sm font-semibold text-gray-800">Struggles</Label>
              <Textarea
                id="struggles"
                value={audienceStruggles}
                onChange={(e) => setAudienceStruggles(e.target.value)}
                placeholder={strugglesFocused ? "" : "What pain points or challenges does your audience face? What problems are they trying to solve?"}
                onFocus={() => setStrugglesFocused(true)}
                onBlur={() => setStrugglesFocused(false)}
                className="h-[240px] resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="desires" className="text-sm font-semibold text-gray-800">Desires</Label>
              <Textarea
                id="desires"
                value={audienceDesires}
                onChange={(e) => setAudienceDesires(e.target.value)}
                placeholder={desiresFocused ? "" : "What are your audience's goals and aspirations? What transformation are they seeking?"}
                onFocus={() => setDesiresFocused(true)}
                onBlur={() => setDesiresFocused(false)}
                className="h-[240px] resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vision Board */}
      <Card id="vision-board" className="rounded-xl bg-white border-0 shadow-none scroll-mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#612A4F]">Vision Board</span>
            {(visionBoardImages.length > 0 || pinterestUrl) && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
          </CardTitle>
          <CardDescription className="ml-11 text-sm text-gray-500">
            Keep your visual inspiration close — revisit it whenever you need creative direction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {visionBoardImages.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {visionBoardImages.map((image, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <img
                    src={image}
                    alt={`Vision board ${index + 1}`}
                    className="w-full h-auto max-h-[600px] object-contain bg-gray-50"
                  />
                  <button
                    onClick={() => removeVisionBoardImage(index)}
                    className="absolute top-4 right-4 p-2 bg-gray-800/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-gray-900/80"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {visionBoardImages.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {showPinterestInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste Pinterest board URL..."
                      autoFocus
                      className="px-4 py-2.5 text-sm border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 w-64"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                          updatePinterestUrl((e.target as HTMLInputElement).value);
                          setShowPinterestInput(false);
                        }
                        if (e.key === 'Escape') {
                          setShowPinterestInput(false);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value) {
                          updatePinterestUrl(e.target.value);
                        }
                        setShowPinterestInput(false);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <button
                      onClick={() => {
                        if (pinterestUrl) {
                          window.open(pinterestUrl, '_blank');
                        } else {
                          setShowPinterestInput(true);
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-b from-white to-[#FAF7F8] border border-[#E8E4E6] rounded-xl hover:border-[#D5CDD2] hover:bg-[#F5F0F3]/50 transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4 text-[#8B7082]" />
                      <span className="text-sm font-medium text-[#4A4A4A]">{pinterestUrl ? 'Open Pinterest Board' : 'Link Pinterest Board'}</span>
                    </button>
                    {pinterestUrl && (
                      <button
                        onClick={() => updatePinterestUrl('')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove Pinterest link"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                <span className="text-sm text-[#8B7082]">or</span>

                <button
                  onClick={handleUploadClick}
                  className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-b from-white to-[#FAF7F8] border border-[#E8E4E6] rounded-xl hover:border-[#D5CDD2] hover:bg-[#F5F0F3]/50 transition-all"
                >
                  <Upload className="w-4 h-4 text-[#8B7082]" />
                  <span className="text-sm font-medium text-[#4A4A4A]">Upload image instead</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleVisionBoardUpload}
                />
              </div>
            </div>
          )}

          {visionBoardImages.length > 0 && (
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleVisionBoardUpload}
            />
          )}
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card className="rounded-xl bg-white border border-[#E8E4E6] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-[#612A4F] text-white shadow-sm">
              <StickyNote className="w-4 h-4" />
            </div>
            <span className="font-semibold text-[#612A4F]">Notes</span>
            {(additionalNotes.trim() || noteLinks.length > 0 || noteFiles.length > 0) && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#EDF3ED] text-[#7a9a7a] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
          </CardTitle>
          <CardDescription className="ml-11 text-sm text-gray-500">
            Capture any additional thoughts, resources, or references
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-6">
            <div className="flex-1">
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Write any additional notes about your brand strategy..."
                className="min-h-[180px] h-full resize-none border border-[#E8E4E6] rounded-xl focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200 p-4 text-sm leading-relaxed"
              />
            </div>

            <div className="w-72 flex-shrink-0 bg-gradient-to-b from-[#FAF8F9] to-[#F0E8ED] rounded-xl p-4 space-y-4 border-l-4 border-[#612A4F]/30">
              <div className="space-y-2.5">
                <p className="text-[11px] text-[#8B7082] font-medium flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3" /> Links
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {noteLinks.map((link, index) => (
                    <div key={index} className="group flex items-center gap-1 bg-white rounded-lg pl-2.5 pr-1.5 py-1.5 shadow-sm hover:shadow transition-shadow">
                      <button
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-[#612A4F] hover:text-[#4A1F3D] transition-colors"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        {link.title}
                      </button>
                      <button
                        onClick={() => setNoteLinks(noteLinks.filter((_, i) => i !== index))}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {!showAddLinkForm && (
                    <button
                      onClick={() => setShowAddLinkForm(true)}
                      className="flex items-center gap-1 text-[11px] text-[#8B7082] hover:text-[#612A4F] border border-[#D5CDD2] hover:border-[#8B7082] rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {showAddLinkForm && (
                  <div className="space-y-1.5">
                    <input
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      placeholder="Link name..."
                      autoFocus
                      className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-[#D8C8E0] focus:outline-none focus:ring-1 focus:ring-[#8B7082] bg-white/80"
                    />
                    <div className="flex gap-1.5">
                      <input
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="URL..."
                        className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-[#D8C8E0] focus:outline-none focus:ring-1 focus:ring-[#8B7082] bg-white/80"
                      />
                      <button
                        onClick={() => {
                          if (newLinkUrl.trim() && newLinkTitle.trim()) {
                            setNoteLinks([...noteLinks, { url: newLinkUrl.trim(), title: newLinkTitle.trim() }]);
                            setNewLinkUrl("");
                            setNewLinkTitle("");
                            setShowAddLinkForm(false);
                          }
                        }}
                        disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}
                        className="text-[11px] px-3 py-1.5 bg-[#8B7082] text-white rounded-lg hover:bg-[#7A6171] disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowAddLinkForm(false);
                          setNewLinkTitle("");
                          setNewLinkUrl("");
                        }}
                        className="text-[11px] px-2 py-1.5 text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2.5">
                <p className="text-[11px] text-[#8B7082] font-medium flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Files
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {noteFiles.map((file, index) => (
                    <div key={index} className="group flex items-center gap-1 bg-white rounded-lg pl-2.5 pr-1.5 py-1.5 shadow-sm hover:shadow transition-shadow">
                      <FileText className="w-3 h-3 text-[#612A4F] flex-shrink-0" />
                      <span className="text-[11px] font-medium text-gray-600 max-w-[100px] truncate">{file.name}</span>
                      <button
                        onClick={() => setNoteFiles(noteFiles.filter((_, i) => i !== index))}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="file"
                    id="note-file-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size <= 5 * 1024 * 1024) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setNoteFiles([...noteFiles, { name: file.name, data: reader.result as string }]);
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => document.getElementById("note-file-upload")?.click()}
                    className="flex items-center gap-1 text-[11px] text-[#8B7082] hover:text-[#612A4F] border border-[#D5CDD2] hover:border-[#8B7082] rounded-lg px-2.5 py-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-center gap-3 pt-2 pb-8">
        <button
          onClick={onSaveAll}
          className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
            showSaveSuccess
              ? "bg-[#EDF3ED] text-[#5a8a5a] border border-[#d0e4d0]"
              : "bg-gradient-to-b from-[#6d3358] to-[#612A4F] text-white hover:from-[#7a3d64] hover:to-[#6d3358] shadow-[0_2px_8px_rgba(97,42,79,0.3)]"
          }`}
        >
          {showSaveSuccess ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </TabsContent>
  );
};

export default BrandIdentityTab;
