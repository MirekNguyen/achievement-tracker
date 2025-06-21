"use client";

import type React from "react";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Target,
  DollarSign,
  Briefcase,
  Activity,
  Award,
  Code,
  Plus,
  Edit,
  Trash2,
  Settings,
  TrendingDown,
  ArrowLeft,
  CheckCircle,
  Clock,
  Trophy,
} from "lucide-react";
import { Achievement, UserProfile, DataEntry } from "./types";
import { achievementsData } from "./(data)/achievements";
import { categoriesData } from "./(data)/categories";
import { historyData } from "./(data)/history";

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "achievements">(
    "dashboard",
  );
  const [selectedCategory, setSelectedCategory] = useState("overview");
  const [selectedAchievementFilter, setSelectedAchievementFilter] = useState<
    "all" | "completed" | "in-progress" | "goals"
  >("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);
  const [addingDataFor, setAddingDataFor] = useState<string | null>(null);
  const [newDataEntry, setNewDataEntry] = useState<any>({});
  const [editingDataCard, setEditingDataCard] = useState<{
    categoryId: string;
    fields: { [key: string]: string };
    title: string;
  } | null>(null);
  const [editingCardData, setEditingCardData] = useState<{
    [key: string]: string;
  }>({});

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "John Doe",
    joinDate: "January 2024",
  });

  // Combined achievements and goals into one array
  const [achievements, setAchievements] =
    useState<Achievement[]>(achievementsData);

  const [categories, setCategories] = useState(categoriesData);

  // Historical data entries for each category
  const [dataHistory, setDataHistory] = useState<DataEntry[]>(historyData);

  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    title: "",
    description: "",
    category: "fitness",
    date: new Date().toISOString().split("T")[0],
    metric: "",
    type: "achievement",
    progress: 0,
  });

  const updateAchievement = (updatedAchievement: Achievement) => {
    setAchievements(
      achievements.map((a) =>
        a.id === updatedAchievement.id ? updatedAchievement : a,
      ),
    );
    setEditingAchievement(null);
  };

  const deleteAchievement = (id: number) => {
    setAchievements(achievements.filter((a) => a.id !== id));
  };

  const toggleAchievementCompletion = (id: number) => {
    setAchievements(
      achievements.map((a) =>
        a.id === id
          ? {
              ...a,
              completed: !a.completed,
              completedDate: !a.completed
                ? new Date().toISOString().split("T")[0]
                : undefined,
              progress: !a.completed && a.type === "goal" ? 100 : a.progress,
            }
          : a,
      ),
    );
  };

  const addAchievement = () => {
    if (newAchievement.title && newAchievement.description) {
      const achievement: Achievement = {
        id: Math.max(...achievements.map((a) => a.id)) + 1,
        title: newAchievement.title!,
        description: newAchievement.description!,
        category: newAchievement.category!,
        date: newAchievement.date!,
        metric: newAchievement.metric || "",
        icon: getCategoryIcon(newAchievement.category!),
        completed: false,
        type: newAchievement.type || "achievement",
        progress:
          newAchievement.type === "goal"
            ? newAchievement.progress || 0
            : undefined,
        target: newAchievement.target || "",
        deadline: newAchievement.deadline || "",
        current: newAchievement.current || "",
      };
      setAchievements([achievement, ...achievements]);
      setNewAchievement({
        title: "",
        description: "",
        category: "fitness",
        date: new Date().toISOString().split("T")[0],
        metric: "",
        type: "achievement",
        progress: 0,
      });
    }
  };

  const addDataEntry = (categoryId: string) => {
    if (Object.keys(newDataEntry).length > 0) {
      const entry: DataEntry = {
        id: Math.max(...dataHistory.map((d) => d.id)) + 1,
        date: new Date().toISOString().split("T")[0],
        categoryId,
        data: { ...newDataEntry },
        note: newDataEntry.note || "",
      };
      setDataHistory([entry, ...dataHistory]);

      // Update current stats with the new data
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        const updatedStats = { ...category.stats, ...newDataEntry };
        delete updatedStats.note;
        updateCategoryStats(categoryId, updatedStats);
      }

      setNewDataEntry({});
      setAddingDataFor(null);
    }
  };

  const updateCategoryStats = (categoryId: string, stats: any) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, stats } : cat,
      ),
    );
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "bg-gray-500";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.icon || Target;
  };

  const getHistoryForCategory = (categoryId: string) => {
    return dataHistory
      .filter((d) => d.categoryId === categoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getBestValue = (categoryId: string, field: string) => {
    const history = getHistoryForCategory(categoryId);
    const values = history.map((h) => h.data[field]).filter(Boolean);

    if (values.length === 0) return null;

    // For pace, weight, body fat - lower is better
    if (
      field.includes("pace") ||
      field.includes("weight") ||
      field.includes("bodyFat")
    ) {
      return Math.min(
        ...values.map((v) =>
          Number.parseFloat(v.toString().replace(/[^\d.]/g, "")),
        ),
      );
    }
    // For most other metrics - higher is better
    return Math.max(
      ...values.map((v) =>
        Number.parseFloat(v.toString().replace(/[^\d.]/g, "")),
      ),
    );
  };

  const getFieldTrend = (categoryId: string, field: string) => {
    const history = getHistoryForCategory(categoryId).slice(0, 2);
    if (history.length < 2) return null;

    const current = Number.parseFloat(
      history[0].data[field]?.toString().replace(/[^\d.]/g, "") || "0",
    );
    const previous = Number.parseFloat(
      history[1].data[field]?.toString().replace(/[^\d.]/g, "") || "0",
    );

    if (current > previous) return "up";
    if (current < previous) return "down";
    return "same";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const userStats = {
    totalAchievements: achievements.length,
    completedAchievements: achievements.filter((a) => a.completed).length,
    activeGoals: achievements.filter((a) => a.type === "goal" && !a.completed)
      .length,
    completedThisMonth: achievements.filter((a) => {
      const achievementDate = new Date(a.date);
      const now = new Date();
      return (
        a.completed &&
        achievementDate.getMonth() === now.getMonth() &&
        achievementDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  const editDataCard = (
    categoryId: string,
    fields: { [key: string]: string },
    title: string,
  ) => {
    setEditingDataCard({ categoryId, fields, title });
    setEditingCardData({ ...fields });
  };

  const updateDataCard = () => {
    if (editingDataCard && Object.keys(editingCardData).length > 0) {
      // Create new data entry
      const entry: DataEntry = {
        id: Math.max(...dataHistory.map((d) => d.id)) + 1,
        date: new Date().toISOString().split("T")[0],
        categoryId: editingDataCard.categoryId,
        data: { ...editingCardData },
        note: `Updated ${editingDataCard.title}`,
      };
      setDataHistory([entry, ...dataHistory]);

      // Update current stats
      const category = categories.find(
        (c) => c.id === editingDataCard.categoryId,
      );
      if (category) {
        const updatedStats = { ...category.stats, ...editingCardData };
        updateCategoryStats(editingDataCard.categoryId, updatedStats);
      }

      setEditingDataCard(null);
      setEditingCardData({});
    }
  };

  // Filter achievements based on selected filter
  const getFilteredAchievements = () => {
    switch (selectedAchievementFilter) {
      case "completed":
        return achievements.filter((a) => a.completed);
      case "in-progress":
        return achievements.filter((a) => !a.completed);
      case "goals":
        return achievements.filter((a) => a.type === "goal");
      default:
        return achievements;
    }
  };

  // Achievements Page Component
  const AchievementsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage("dashboard")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <span>Achievements & Goals</span>
              </h1>
              <p className="text-gray-600">
                Track your accomplishments and long-term objectives
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userStats.completedAchievements}
              </div>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userStats.activeGoals}
              </div>
              <p className="text-sm text-gray-500">Active Goals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userStats.completedThisMonth}
              </div>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Achievement</DialogTitle>
                  <DialogDescription>
                    Add a new achievement or goal to track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-achievement-type">Type</Label>
                    <Select
                      value={newAchievement.type}
                      onValueChange={(value: "achievement" | "goal") =>
                        setNewAchievement({ ...newAchievement, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">
                          🏆 Achievement (One-time accomplishment)
                        </SelectItem>
                        <SelectItem value="goal">
                          🎯 Goal (Long-term objective with progress)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-achievement-title">Title</Label>
                    <Input
                      id="new-achievement-title"
                      value={newAchievement.title || ""}
                      onChange={(e) =>
                        setNewAchievement({
                          ...newAchievement,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Complete Marathon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-achievement-description">
                      Description
                    </Label>
                    <Textarea
                      id="new-achievement-description"
                      value={newAchievement.description || ""}
                      onChange={(e) =>
                        setNewAchievement({
                          ...newAchievement,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe what this involves..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-achievement-category">Category</Label>
                    <Select
                      value={newAchievement.category}
                      onValueChange={(value) =>
                        setNewAchievement({
                          ...newAchievement,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-achievement-metric">
                      Target/Metric
                    </Label>
                    <Input
                      id="new-achievement-metric"
                      value={newAchievement.metric || ""}
                      onChange={(e) =>
                        setNewAchievement({
                          ...newAchievement,
                          metric: e.target.value,
                        })
                      }
                      placeholder="e.g., Sub 4:00:00 or $50,000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-achievement-date">Target Date</Label>
                    <Input
                      id="new-achievement-date"
                      type="date"
                      value={newAchievement.date || ""}
                      onChange={(e) =>
                        setNewAchievement({
                          ...newAchievement,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  {newAchievement.type === "goal" && (
                    <>
                      <div>
                        <Label htmlFor="new-achievement-current">
                          Current Status
                        </Label>
                        <Input
                          id="new-achievement-current"
                          value={newAchievement.current || ""}
                          onChange={(e) =>
                            setNewAchievement({
                              ...newAchievement,
                              current: e.target.value,
                            })
                          }
                          placeholder="e.g., Can run 10K"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-achievement-progress">
                          Progress (%)
                        </Label>
                        <Input
                          id="new-achievement-progress"
                          type="number"
                          min="0"
                          max="100"
                          value={newAchievement.progress || 0}
                          onChange={(e) =>
                            setNewAchievement({
                              ...newAchievement,
                              progress: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setNewAchievement({
                        title: "",
                        description: "",
                        category: "fitness",
                        date: new Date().toISOString().split("T")[0],
                        metric: "",
                        type: "achievement",
                        progress: 0,
                      })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      addAchievement();
                      setNewAchievement({
                        title: "",
                        description: "",
                        category: "fitness",
                        date: new Date().toISOString().split("T")[0],
                        metric: "",
                        type: "achievement",
                        progress: 0,
                      });
                    }}
                  >
                    Create{" "}
                    {newAchievement.type === "goal" ? "Goal" : "Achievement"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              {[
                { key: "all", label: "All", icon: Trophy },
                { key: "completed", label: "Completed", icon: CheckCircle },
                { key: "in-progress", label: "In Progress", icon: Clock },
                { key: "goals", label: "Goals", icon: Target },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={
                    selectedAchievementFilter === key ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedAchievementFilter(key as any)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {key === "all" && achievements.length}
                    {key === "completed" &&
                      achievements.filter((a) => a.completed).length}
                    {key === "in-progress" &&
                      achievements.filter((a) => !a.completed).length}
                    {key === "goals" &&
                      achievements.filter((a) => a.type === "goal").length}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredAchievements().map((achievement) => {
            const Icon = achievement.icon;
            const isGoal = achievement.type === "goal";
            return (
              <Card
                key={achievement.id}
                className={`relative ${achievement.completed ? "border-green-200 bg-green-50" : "border-gray-200"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge
                          variant={
                            achievement.completed ? "default" : "secondary"
                          }
                        >
                          {
                            categories.find(
                              (c) => c.id === achievement.category,
                            )?.name
                          }
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {isGoal ? "🎯 Goal" : "🏆 Achievement"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAchievement(achievement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAchievement(achievement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col h-full">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {achievement.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{achievement.metric}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target Date:</span>
                      <span className="font-medium">
                        {new Date(achievement.date).toLocaleDateString()}
                      </span>
                    </div>
                    {isGoal && achievement.current && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">
                          {achievement.current}
                        </span>
                      </div>
                    )}
                    {achievement.completed && achievement.completedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium text-green-600">
                          {new Date(
                            achievement.completedDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {isGoal && achievement.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {achievement.progress}%
                        </span>
                      </div>
                      <Progress value={achievement.progress} className="h-3" />
                    </div>
                  )}

                  <div className="pt-2 border-t mt-auto">
                    <Button
                      onClick={() =>
                        toggleAchievementCompletion(achievement.id)
                      }
                      variant={achievement.completed ? "outline" : "default"}
                      className={`w-full ${achievement.completed ? "text-green-600 border-green-300" : ""}`}
                    >
                      {achievement.completed ? (
                        <>
                          <Award className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>

                {achievement.completed && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                )}

                {isGoal && !achievement.completed && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <Target className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Main Dashboard Component
  const DashboardPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userProfile.name}
              </h1>
              <p className="text-gray-600">
                Personal Achievement Tracker • Member since{" "}
                {userProfile.joinDate}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userStats.activeGoals}
              </div>
              <p className="text-sm text-gray-500">Active Goals</p>
            </div>
            <div
              className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => setCurrentPage("achievements")}
            >
              <div className="text-2xl font-bold text-green-600">
                {userStats.totalAchievements}
              </div>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userStats.completedThisMonth}
              </div>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage("achievements")}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </Button>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Settings & Administration</DialogTitle>
                    <DialogDescription>
                      Manage your categories, stats, and achievements
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="categories" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                      <TabsTrigger value="achievements">
                        Achievements
                      </TabsTrigger>
                      <TabsTrigger value="data">Data Management</TabsTrigger>
                    </TabsList>
                    <TabsContent value="categories" className="space-y-4">
                      {categories.map((category) => (
                        <Card key={category.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <div className={`p-2 rounded ${category.color}`}>
                                <category.icon className="h-4 w-4 text-white" />
                              </div>
                              <span>{category.name}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(category.stats).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <Label className="text-sm capitalize">
                                      {key.replace(/([A-Z])/g, " $1")}
                                    </Label>
                                    <Input
                                      value={value}
                                      onChange={(e) => {
                                        const newStats = {
                                          ...category.stats,
                                          [key]: e.target.value,
                                        };
                                        updateCategoryStats(
                                          category.id,
                                          newStats,
                                        );
                                      }}
                                    />
                                  </div>
                                ),
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    <TabsContent value="achievements" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          Manage Achievements & Goals
                        </h3>
                        <Button onClick={() => setCurrentPage("achievements")}>
                          <Trophy className="h-4 w-4 mr-2" />
                          View All Items
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {achievements.slice(0, 5).map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">
                                  {achievement.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {achievement.type === "goal" ? "🎯" : "🏆"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {achievement.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {achievement.date} • {achievement.metric}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setEditingAchievement(achievement)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAchievements(
                                    achievements.filter(
                                      (a) => a.id !== achievement.id,
                                    ),
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {achievements.length > 5 && (
                          <div className="text-center pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentPage("achievements")}
                            >
                              View All {achievements.length} Items
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="data" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Export Data
                          </h3>
                          <Button
                            onClick={() => {
                              const data = {
                                userProfile,
                                achievements,
                                categories,
                                dataHistory,
                              };
                              const blob = new Blob(
                                [JSON.stringify(data, null, 2)],
                                { type: "application/json" },
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = "achievement-tracker-data.json";
                              a.click();
                            }}
                          >
                            Download Data as JSON
                          </Button>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Reset Data
                          </h3>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to reset all data? This cannot be undone.",
                                )
                              ) {
                                setAchievements([]);
                                setDataHistory([]);
                              }
                            }}
                          >
                            Reset All Data
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="career">Career</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Categories Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                    onClick={() => {
                      // Create a subset of key stats for quick editing
                      const keyStats = Object.entries(category.stats)
                        .slice(0, 4)
                        .reduce(
                          (acc, [key, value]) => {
                            acc[key] = value;
                            return acc;
                          },
                          {} as { [key: string]: string },
                        );

                      editDataCard(
                        category.id,
                        keyStats,
                        `${category.name} Overview`,
                      );
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {Object.keys(category.stats).length} metrics
                          </Badge>
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-3">
                        {category.name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(category.stats)
                          .slice(0, 3)
                          .map(([key, value]) => {
                            const trend = getFieldTrend(category.id, key);
                            return (
                              <div
                                key={key}
                                className="flex justify-between items-center"
                              >
                                <span className="text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium">{value}</span>
                                  {trend === "up" && (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                  )}
                                  {trend === "down" && (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        {Object.keys(category.stats).length > 3 && (
                          <div className="text-xs text-gray-500 pt-1">
                            +{Object.keys(category.stats).length - 3} more
                            metrics
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Active Goals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <CardTitle>Active Goals</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage("achievements")}
                  >
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Long-term objectives with progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements
                    .filter((a) => a.type === "goal" && !a.completed)
                    .slice(0, 4)
                    .map((goal) => {
                      const Icon = goal.icon;
                      return (
                        <div
                          key={goal.id}
                          className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setCurrentPage("achievements")}
                        >
                          <div
                            className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{goal.title}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {goal.deadline}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAchievement(goal);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {goal.current}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={goal.progress || 0}
                                className="flex-1 h-2"
                              />
                              <span className="text-sm font-medium">
                                {goal.progress || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage("achievements")}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter((a) => a.completed)
                    .slice(0, 4)
                    .map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setCurrentPage("achievements")}
                        >
                          <div
                            className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">
                                {achievement.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {achievement.type === "goal" ? "🎯" : "🏆"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {achievement.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {achievement.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {achievement.metric}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fitness" className="space-y-6">
            {/* Fitness Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                categories.find((c) => c.id === "fitness")?.stats || {},
              ).map(([key, value]) => {
                const trend = getFieldTrend("fitness", key);
                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-green-300"
                    onClick={() =>
                      editDataCard(
                        "fitness",
                        { [key]: value },
                        `Update ${key.replace(/([A-Z])/g, " $1")}`,
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Activity className="h-6 w-6 text-green-600" />
                        <div className="flex items-center space-x-1">
                          {trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <div className="text-2xl font-bold text-green-600">
                        {value}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.includes("pace") && "Average running pace"}
                        {key.includes("weight") && "Current body weight"}
                        {key.includes("distance") && "Total distance covered"}
                        {key.includes("bodyFat") && "Body fat percentage"}
                        {!key.includes("pace") &&
                          !key.includes("weight") &&
                          !key.includes("distance") &&
                          !key.includes("bodyFat") &&
                          "Fitness metric"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Fitness History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>Fitness History</span>
                </CardTitle>
                <CardDescription>Recent fitness data entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getHistoryForCategory("fitness")
                    .slice(0, 5)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-sm text-gray-600 space-x-4">
                            {Object.entries(entry.data).map(([key, value]) => (
                              <span key={key}>
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>{" "}
                                {value}
                              </span>
                            ))}
                          </div>
                          {entry.note && (
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Fitness Data */}
            <Card>
              <CardHeader>
                <CardTitle>Add Fitness Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAddingDataFor("fitness")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Fitness Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            {/* Financial Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                categories.find((c) => c.id === "finances")?.stats || {},
              ).map(([key, value]) => {
                const trend = getFieldTrend("finances", key);
                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-emerald-300"
                    onClick={() =>
                      editDataCard(
                        "finances",
                        { [key]: value },
                        `Update ${key.replace(/([A-Z])/g, " $1")}`,
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                        <div className="flex items-center space-x-1">
                          {trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <div className="text-2xl font-bold text-emerald-600">
                        {value}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.includes("netWorth") &&
                          "Total assets minus liabilities"}
                        {key.includes("income") && "Monthly gross income"}
                        {key.includes("savings") && "Money saved this period"}
                        {key.includes("investment") &&
                          "Investment portfolio value"}
                        {!key.includes("netWorth") &&
                          !key.includes("income") &&
                          !key.includes("savings") &&
                          !key.includes("investment") &&
                          "Financial metric"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Financial History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span>Financial History</span>
                </CardTitle>
                <CardDescription>Recent financial data entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getHistoryForCategory("finances")
                    .slice(0, 5)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-sm text-gray-600 space-x-4">
                            {Object.entries(entry.data).map(([key, value]) => (
                              <span key={key}>
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>{" "}
                                {value}
                              </span>
                            ))}
                          </div>
                          {entry.note && (
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Financial Data */}
            <Card>
              <CardHeader>
                <CardTitle>Add Financial Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAddingDataFor("finances")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Financial Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            {/* Learning Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                categories.find((c) => c.id === "learning")?.stats || {},
              ).map(([key, value]) => {
                const trend = getFieldTrend("learning", key);
                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                    onClick={() =>
                      editDataCard(
                        "learning",
                        { [key]: value },
                        `Update ${key.replace(/([A-Z])/g, " $1")}`,
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Code className="h-6 w-6 text-blue-600" />
                        <div className="flex items-center space-x-1">
                          {trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <div className="text-2xl font-bold text-blue-600">
                        {value}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.includes("degree") && "Academic progress"}
                        {key.includes("gpa") && "Grade point average"}
                        {key.includes("courses") && "Completed coursework"}
                        {key.includes("skills") && "New skills acquired"}
                        {!key.includes("degree") &&
                          !key.includes("gpa") &&
                          !key.includes("courses") &&
                          !key.includes("skills") &&
                          "Learning metric"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Learning History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  <span>Learning History</span>
                </CardTitle>
                <CardDescription>Recent learning data entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getHistoryForCategory("learning")
                    .slice(0, 5)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-sm text-gray-600 space-x-4">
                            {Object.entries(entry.data).map(([key, value]) => (
                              <span key={key}>
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>{" "}
                                {value}
                              </span>
                            ))}
                          </div>
                          {entry.note && (
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Learning Data */}
            <Card>
              <CardHeader>
                <CardTitle>Add Learning Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAddingDataFor("learning")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Learning Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="space-y-6">
            {/* Career Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                categories.find((c) => c.id === "career")?.stats || {},
              ).map(([key, value]) => {
                const trend = getFieldTrend("career", key);
                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-purple-300"
                    onClick={() =>
                      editDataCard(
                        "career",
                        { [key]: value },
                        `Update ${key.replace(/([A-Z])/g, " $1")}`,
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Briefcase className="h-6 w-6 text-purple-600" />
                        <div className="flex items-center space-x-1">
                          {trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          {trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <div className="text-2xl font-bold text-purple-600">
                        {value}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {key.includes("salary") && "Annual compensation"}
                        {key.includes("role") && "Current job position"}
                        {key.includes("experience") && "Years in field"}
                        {key.includes("projects") && "Completed work projects"}
                        {!key.includes("salary") &&
                          !key.includes("role") &&
                          !key.includes("experience") &&
                          !key.includes("projects") &&
                          "Career metric"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Career History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <span>Career History</span>
                </CardTitle>
                <CardDescription>Recent career data entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getHistoryForCategory("career")
                    .slice(0, 5)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-sm text-gray-600 space-x-4">
                            {Object.entries(entry.data).map(([key, value]) => (
                              <span key={key}>
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}:
                                </span>{" "}
                                {value}
                              </span>
                            ))}
                          </div>
                          {entry.note && (
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.note}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Career Data */}
            <Card>
              <CardHeader>
                <CardTitle>Add Career Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAddingDataFor("career")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Career Entry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <>
          {currentPage === "dashboard" && <DashboardPage />}
          {currentPage === "achievements" && <AchievementsPage />}

          {/* Edit Achievement Dialog */}
          {editingAchievement && (
            <Dialog
              open={!!editingAchievement}
              onOpenChange={() => setEditingAchievement(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Edit{" "}
                    {editingAchievement.type === "goal"
                      ? "Goal"
                      : "Achievement"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-achievement-type">Type</Label>
                    <Select
                      value={editingAchievement.type}
                      onValueChange={(value: "achievement" | "goal") =>
                        setEditingAchievement({
                          ...editingAchievement,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">
                          🏆 Achievement
                        </SelectItem>
                        <SelectItem value="goal">🎯 Goal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-achievement-title">Title</Label>
                    <Input
                      id="edit-achievement-title"
                      value={editingAchievement.title}
                      onChange={(e) =>
                        setEditingAchievement({
                          ...editingAchievement,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-achievement-description">
                      Description
                    </Label>
                    <Textarea
                      id="edit-achievement-description"
                      value={editingAchievement.description}
                      onChange={(e) =>
                        setEditingAchievement({
                          ...editingAchievement,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-achievement-category">Category</Label>
                    <Select
                      value={editingAchievement.category}
                      onValueChange={(value) =>
                        setEditingAchievement({
                          ...editingAchievement,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-achievement-metric">
                      Target/Metric
                    </Label>
                    <Input
                      id="edit-achievement-metric"
                      value={editingAchievement.metric}
                      onChange={(e) =>
                        setEditingAchievement({
                          ...editingAchievement,
                          metric: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-achievement-date">Target Date</Label>
                    <Input
                      id="edit-achievement-date"
                      type="date"
                      value={editingAchievement.date}
                      onChange={(e) =>
                        setEditingAchievement({
                          ...editingAchievement,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  {editingAchievement.type === "goal" && (
                    <>
                      <div>
                        <Label htmlFor="edit-achievement-current">
                          Current Status
                        </Label>
                        <Input
                          id="edit-achievement-current"
                          value={editingAchievement.current || ""}
                          onChange={(e) =>
                            setEditingAchievement({
                              ...editingAchievement,
                              current: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-achievement-progress">
                          Progress (%)
                        </Label>
                        <Input
                          id="edit-achievement-progress"
                          type="number"
                          min="0"
                          max="100"
                          value={editingAchievement.progress || 0}
                          onChange={(e) =>
                            setEditingAchievement({
                              ...editingAchievement,
                              progress: Number.parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingAchievement(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => updateAchievement(editingAchievement)}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Add Data Entry Dialog */}
          {addingDataFor && (
            <Dialog
              open={!!addingDataFor}
              onOpenChange={() => setAddingDataFor(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Add New{" "}
                    {categories.find((c) => c.id === addingDataFor)?.name} Entry
                  </DialogTitle>
                  <DialogDescription>
                    Enter new data for this category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.keys(
                    categories.find((c) => c.id === addingDataFor)?.stats || {},
                  )
                    .slice(0, 6)
                    .map((key) => (
                      <div key={key}>
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </Label>
                        <Input
                          id={key}
                          value={newDataEntry[key] || ""}
                          onChange={(e) =>
                            setNewDataEntry({
                              ...newDataEntry,
                              [key]: e.target.value,
                            })
                          }
                          placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                        />
                      </div>
                    ))}
                  <div>
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Textarea
                      id="note"
                      value={newDataEntry.note || ""}
                      onChange={(e) =>
                        setNewDataEntry({
                          ...newDataEntry,
                          note: e.target.value,
                        })
                      }
                      placeholder="Add any notes about this entry..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAddingDataFor(null);
                      setNewDataEntry({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => addDataEntry(addingDataFor!)}>
                    Add Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Data Card Dialog */}
          {editingDataCard && (
            <Dialog
              open={!!editingDataCard}
              onOpenChange={() => setEditingDataCard(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update {editingDataCard.title}</DialogTitle>
                  <DialogDescription>
                    Edit the values for this data group
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.entries(editingCardData).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </Label>
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) =>
                          setEditingCardData({
                            ...editingCardData,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={`e.g., ${value}`}
                      />
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingDataCard(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={updateDataCard}>Update Values</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
    </>
  );
}
