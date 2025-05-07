
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder: string;
  onSearch: (term: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-8 w-full"
      />
    </div>
  );
};

export default SearchBar;
