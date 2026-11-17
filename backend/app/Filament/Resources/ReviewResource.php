<?php

namespace App\Filament\Resources;

use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationGroup = 'Catalog';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('product_id')->relationship('product', 'name_en')->disabled(),
            Forms\Components\TextInput::make('name')->disabled(),
            Forms\Components\TextInput::make('rating')->numeric()->disabled(),
            Forms\Components\Textarea::make('body')->disabled(),
            Forms\Components\Toggle::make('is_approved')->label('Approve for Public Display'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Tables\Columns\TextColumn::make('product.name_en'),
            Tables\Columns\TextColumn::make('name'),
            Tables\Columns\TextColumn::make('rating'),
            Tables\Columns\IconColumn::make('is_approved')->boolean()->label('Approved'),
            Tables\Columns\TextColumn::make('created_at')->dateTime(),
        ]);
    }
}

