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
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery && setShowSuggestions(true)}
          placeholder={placeholder || 'Search and add skills...'}
          className="w-full px-4 py-3 bg-[#fdf6f0] border border-[#f0e6dd] rounded-xl focus:ring-2 focus:ring-[#eb7823] focus:border-transparent transition-all outline-none text-[#1a1a1a] placeholder-[#8a7a70]/50"
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-20 w-full mt-2 bg-white border border-[#f0e6dd] rounded-xl shadow-xl max-h-60 overflow-y-auto"
          >
            {suggestions.map((skill, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddSkill(skill)}
                className="w-full px-4 py-2.5 text-left text-[#1a1a1a] hover:bg-[#eb7823]/10 focus:bg-[#eb7823]/10 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eb7823]/10 text-[#eb7823] border border-[#eb7823]/20 rounded-full text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-[#6e3787] focus:outline-none transition-colors font-bold"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-[#8a7a70]">
        {searchQuery && !showSuggestions && 'Press Enter to add custom skill'}
      </p>
    </div>
  );
}
