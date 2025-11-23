'use client';

import { useState, useEffect, useRef } from 'react';

interface Skill {
  name: string;
  category?: string;
}

interface SearchableSkillInputProps {
  skillType: 'it' | 'soft';
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
}

export default function SearchableSkillInput({
  skillType,
  selectedSkills,
  onSkillsChange,
  placeholder,
}: SearchableSkillInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load skills from CSV files
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const fileName = skillType === 'it' ? 'it_skills.csv' : 'soft_skills.csv';
        const response = await fetch(`/data/skills/${fileName}`);
        const text = await response.text();
        
        // Parse CSV (skip header row)
        const lines = text.split('\n').slice(1);
        const skills = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            // Handle CSV with quotes
            return line.replace(/^"|"$/g, '').trim();
          });
        
        setAllSkills(skills);
      } catch (error) {
        console.error('Error loading skills:', error);
      }
    };

    loadSkills();
  }, [skillType]);

  // Handle search input change
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allSkills
        .filter(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedSkills.includes(skill)
        )
        .slice(0, 10); // Limit to 10 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allSkills, selectedSkills]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill]);
    }
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAddSkill(suggestions[0]);
      } else {
        // Allow adding custom skill
        handleAddSkill(searchQuery.trim());
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery && setShowSuggestions(true)}
          placeholder={placeholder || 'Tìm kiếm và thêm kỹ năng...'}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((skill, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddSkill(skill)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-blue-600 focus:outline-none"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        {searchQuery && !showSuggestions && 'Nhấn Enter để thêm kỹ năng tùy chỉnh'}
      </p>
    </div>
  );
}
