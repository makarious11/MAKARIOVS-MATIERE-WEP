<?php

namespace App\Filament\Resources;

use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('name_en')->label('Name (English)')->required(),
            Forms\Components\TextInput::make('name_ar')->label('Name (Arabic)')->required(),
            Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
            Forms\Components\TextInput::make('tagline_en')->label('Tagline (English)'),
            Forms\Components\TextInput::make('tagline_ar')->label('Tagline (Arabic)'),
            Forms\Components\Textarea::make('description_en')->rows(3),
            Forms\Components\Textarea::make('description_ar')->rows(3),
            Forms\Components\TextInput::make('image_url')->label('Cover Image URL'),
            Forms\Components\Toggle::make('is_active')->default(true),
            Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('name_en')->sortable()->searchable(),
            Tables\Columns\TextColumn::make('name_ar')->searchable(),
            Tables\Columns\TextColumn::make('slug'),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
            Tables\Columns\TextColumn::make('sort_order')->sortable(),
            Tables\Columns\TextColumn::make('products_count')->counts('products')->label('Products'),
        ]);
    }
}

